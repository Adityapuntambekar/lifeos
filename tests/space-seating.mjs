import assert from 'node:assert/strict'
import http from 'node:http'
import {WebSocket} from 'ws'
import {attachSpace} from '../server/space.ts'
import {route,seats} from '../shared/spaceWorld.ts'
const server=http.createServer(),cleanup=attachSpace(server);await new Promise(r=>server.listen(0,'127.0.0.1',r));const clients=[]
async function client(name){const ws=new WebSocket(`ws://127.0.0.1:${server.address().port}/space`),messages=[];clients.push(ws);ws.on('message',v=>messages.push(JSON.parse(v)));await new Promise(r=>ws.once('open',r));return {ws,messages,send:v=>ws.send(JSON.stringify(v)),wait:(predicate,from=messages.length)=>new Promise((resolve,reject)=>{const poll=setInterval(()=>{const result=messages.slice(from).find(predicate);if(result){clearInterval(poll);clearTimeout(timeout);resolve(result)}},10),timeout=setTimeout(()=>{clearInterval(poll);reject(Error('State update timed out'))},4000)})}}
async function update(c,value,predicate){const from=c.messages.length;c.send(value);return c.wait(predicate,from)}
async function walk(c,id,target){const person=c.messages.filter(m=>m.type==='state').at(-1).people.find(p=>p.id===id);for(const point of route(person,target)){await update(c,{type:'move',...point},m=>m.type==='state'&&m.people.some(p=>p.id===id&&p.x===point.x&&p.y===point.y));await new Promise(r=>setTimeout(r,25))}}
try{
 const a=await client('Ada'),b=await client('Ben');const aw=await update(a,{type:'join',room:'seating-test-123',name:'Ada'},m=>m.type==='welcome'),bw=await update(b,{type:'join',room:'seating-test-123',name:'Ben'},m=>m.type==='welcome');await a.wait(m=>m.type==='state'&&m.people.length===2,0)
 const seat=seats[0];await update(a,{type:'sit',seat:seat.id},m=>m.type==='error'&&m.text.includes('closer'))
 await walk(a,aw.id,seat);await update(a,{type:'sit',seat:seat.id},m=>m.type==='state'&&m.people.find(p=>p.id===aw.id)?.seat===seat.id)
 await walk(b,bw.id,seat);await update(b,{type:'sit',seat:seat.id},m=>m.type==='error'&&m.text.includes('already'))
 await update(a,{type:'personal',enabled:true},m=>m.type==='state'&&m.people.find(p=>p.id===aw.id)?.personal)
 const state=await update(a,{type:'voice',enabled:true},m=>m.type==='state');assert.equal(state.people.find(p=>p.id===aw.id).voice,false);assert.equal(state.people.find(p=>p.id===aw.id).seat,'')
 await update(b,{type:'sit',seat:seat.id},m=>m.type==='state'&&m.people.find(p=>p.id===bw.id)?.seat===seat.id)
 await update(b,{type:'move',x:seat.x+2,y:seat.y},m=>m.type==='state'&&m.people.find(p=>p.id===bw.id)?.seat==='')
 await update(a,{type:'personal',enabled:false},m=>m.type==='state'&&!m.people.find(p=>p.id===aw.id)?.personal)
 await update(a,{type:'sit',seat:seat.id},m=>m.type==='state'&&m.people.find(p=>p.id===aw.id)?.seat===seat.id)
 a.ws.close();await b.wait(m=>m.type==='state'&&m.people.length===1, b.messages.length)
 await update(b,{type:'sit',seat:seat.id},m=>m.type==='state'&&m.people[0].seat===seat.id)
 await update(b,{type:'stand'},m=>m.type==='state'&&m.people[0].seat==='')
 console.log('Shared seating checks passed: distance validation, exclusive occupancy, solo-room release/muting, stand on movement and disconnect release.')
}finally{for(const ws of clients)ws.terminate();cleanup();await new Promise(r=>server.close(r))}
