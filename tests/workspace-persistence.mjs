import assert from 'node:assert/strict'
import http from 'node:http'
import {mkdtempSync,rmSync,writeFileSync,readFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {WebSocket} from 'ws'
import {attachSpace} from '../server/space.ts'
import {WorkspaceStore} from '../server/workspaceStore.ts'
import {defaultStudio} from '../shared/studioWorld.ts'
const directory=mkdtempSync(join(tmpdir(),'lifeos-persistence-')),clients=[]
let server,cleanup
async function start(){server=http.createServer();cleanup=attachSpace(server,{directory});await new Promise(r=>server.listen(0,'127.0.0.1',r))}
async function stop(){clients.splice(0).forEach(c=>c.terminate());cleanup();await new Promise(r=>server.close(r))}
async function client(identity){const ws=new WebSocket(`ws://127.0.0.1:${server.address().port}/space`),messages=[];clients.push(ws);ws.on('message',raw=>messages.push(JSON.parse(raw)));await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j)});const request=async(value,predicate)=>{const from=messages.length;ws.send(JSON.stringify(value));for(let i=0;i<200;i++){const found=messages.slice(from).find(predicate);if(found)return found;await new Promise(r=>setTimeout(r,10))}throw Error('Timed out')};const initial=await request({type:'join',room:'persist-test',name:'Tester',identity,workspaceName:'Study home'},m=>m.type==='state');return {ws,messages,request,initial}}
try{
 await start();let owner=await client('a'.repeat(64));assert.equal(owner.initial.persistent,true);assert.ok(owner.initial.host)
 const world=defaultStudio();world.rooms[0].name='Persistent library'
 const confirmed=await owner.request({type:'studio-publish',world,revision:0,requestId:'first-save'},m=>m.type==='studio-published');assert.equal(confirmed.requestId,'first-save');assert.equal(confirmed.revision,1)
 const raw=readFileSync(join(directory,'persist-test.json'),'utf8');assert.ok(!raw.includes('a'.repeat(64)));assert.ok(!raw.includes('reflection'))
 await stop();await start();const guest=await client('b'.repeat(64));assert.equal(guest.initial.host,'');assert.equal(guest.initial.studio.rooms[0].name,'Persistent library');assert.equal(guest.initial.studioRevision,1)
 await guest.request({type:'studio-publish',world,revision:1},m=>m.type==='error')
 owner=await client('a'.repeat(64));assert.ok(owner.initial.host);assert.equal(owner.initial.workspaceName,'Study home')
 await owner.request({type:'studio-publish',world,revision:1},m=>m.type==='state'&&m.studioRevision===2)
 await owner.request({type:'studio-publish',world,revision:1},m=>m.type==='error'&&m.text.includes('changed'))
 const originalWrite=WorkspaceStore.prototype.write;WorkspaceStore.prototype.write=()=>{throw Error('Simulated disk full')}
 try{const failed=await owner.request({type:'studio-publish',world,revision:2,requestId:'failed-save'},m=>m.type==='error');assert.equal(failed.operation,'studio-publish');assert.equal(failed.requestId,'failed-save');const unchanged=await owner.request({type:'goal',text:'Check revision'},m=>m.type==='state');assert.equal(unchanged.studioRevision,2)}finally{WorkspaceStore.prototype.write=originalWrite}
 await stop();writeFileSync(join(directory,'persist-test.json'),'broken original');assert.throws(()=>new WorkspaceStore(directory).read('persist-test'),/unreadable/);assert.equal(readFileSync(join(directory,'persist-test.json'),'utf8'),'broken original')
 console.log('Persistent workspace checks passed: restart, revisions, owner recovery, guest denial, private-field exclusion and corrupt-file protection.')
}finally{if(server?.listening)await stop();rmSync(directory,{recursive:true,force:true})}
