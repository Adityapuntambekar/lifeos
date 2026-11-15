import assert from 'node:assert/strict'
import http from 'node:http'
import {WebSocket} from 'ws'
import {attachSpace} from '../server/space.ts'
const server=http.createServer();const cleanup=attachSpace(server);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`ws://127.0.0.1:${server.address().port}/space`
const clients=[]
async function client(room,name){const ws=new WebSocket(url),messages=[];clients.push(ws);ws.on('message',data=>messages.push(JSON.parse(data)));await new Promise(resolve=>ws.once('open',resolve));ws.send(JSON.stringify({type:'join',room,name,color:'#8569c4'}));return {ws,messages,send:value=>ws.send(JSON.stringify(value)),wait:predicate=>new Promise((resolve,reject)=>{const found=messages.find(predicate);if(found)return resolve(found);const timer=setTimeout(()=>{ws.off('message',listener);reject(new Error('Timed out waiting for server message'))},3000);const listener=raw=>{const value=JSON.parse(raw);if(predicate(value)){clearTimeout(timer);ws.off('message',listener);resolve(value)}};ws.on('message',listener)})}}
try{
 const a=await client('room-alpha-123','Ada'),b=await client('room-alpha-123','Ben'),c=await client('room-other-123','Other')
 const aid=(await a.wait(m=>m.type==='welcome')).id,bid=(await b.wait(m=>m.type==='welcome')).id
 await a.wait(m=>m.type==='state'&&m.people.length===2);await c.wait(m=>m.type==='state'&&m.people.length===1)
 a.send({type:'chat',text:'hello shared world'});await b.wait(m=>m.type==='chat'&&m.message.text==='hello shared world')
 a.send({type:'move',x:75,y:25});await b.wait(m=>m.type==='state'&&m.people.find(p=>p.id===aid)?.zone==='group')
 a.send({type:'voice',enabled:true});await b.wait(m=>m.type==='state'&&m.people.find(p=>p.id===aid)?.voice)
 a.send({type:'move',x:25,y:25});await b.wait(m=>m.type==='state'&&m.people.find(p=>p.id===aid)?.zone==='quiet'&&!m.people.find(p=>p.id===aid)?.voice)
 a.send({type:'timer'});await b.wait(m=>m.type==='state'&&m.timers.quiet>Date.now())
 b.send({type:'board',text:'Study networking'});await a.wait(m=>m.type==='state'&&m.board==='Study networking')
 a.send({type:'signal',to:bid,data:{description:{type:'offer',sdp:'blocked'}}});a.send({type:'chat',text:'barrier'});await b.wait(m=>m.type==='chat'&&m.message.text==='barrier')
 assert.equal(b.messages.some(m=>m.type==='signal'),false,'Muted or cross-zone signalling must be blocked')
 assert.equal(c.messages.some(m=>m.type==='chat'),false,'Other rooms must not receive chat')
 b.ws.close();await a.wait(m=>m.type==='state'&&m.people.length===1&&m.people[0].id===aid)
 console.log('Space server checks passed: shared presence, chat, room isolation, zone movement/muting, shared timer/board, signal restrictions and disconnect cleanup.')
}finally{for(const ws of clients)ws.terminate();cleanup();await new Promise(resolve=>server.close(resolve))}
