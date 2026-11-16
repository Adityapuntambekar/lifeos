import assert from 'node:assert/strict'
import http from 'node:http'
import {WebSocket} from 'ws'
import {attachSpace} from '../server/space.ts'
import {defaultStudio,validStudio,roomTemplate,templateNames,studioRoute,spawn,free,isSeat,placeable} from '../shared/studioWorld.ts'
import {parseBackup} from '../src/backup.ts'
for(const kind of Object.keys(templateNames))assert.ok(validStudio({version:1,rooms:[roomTemplate(kind,kind)]}),kind)
const world=defaultStudio();assert.ok(validStudio(world));assert.deepEqual(parseBackup(JSON.stringify({'lifeos.space.studio':world})).data['lifeos.space.studio'],world)
const bad=structuredClone(world);bad.rooms[0].objects.push({id:'bad',kind:'unknown',x:2,y:2,rotation:0,color:'#ffffff'});assert.equal(validStudio(bad),false)
assert.equal(validStudio({version:1,rooms:[]}),false);assert.equal(validStudio({...world,rooms:[world.rooms[0],world.rooms[0]]}),false)
for(const room of world.rooms){assert.equal(placeable(room,{id:'door',kind:'plant',x:10,y:12,rotation:0,color:'#ffffff'}),false);for(const seat of room.objects.filter(isSeat)){let last=spawn;for(const p of studioRoute(room,spawn,seat)){assert.equal(Math.abs(last.x-p.x)+Math.abs(last.y-p.y),1);assert.ok(free(room,p.x,p.y));last=p}assert.ok(Math.hypot(last.x-seat.x,last.y-seat.y)<=1.5,`${room.name}: reachable seat ${seat.id}`)}}
const server=http.createServer(),cleanup=attachSpace(server);await new Promise(r=>server.listen(0,'127.0.0.1',r));const clients=[]
async function client(){const ws=new WebSocket(`ws://127.0.0.1:${server.address().port}/space`),messages=[];clients.push(ws);ws.on('message',v=>messages.push(JSON.parse(v)));await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j)});return {ws,messages,send:v=>ws.send(JSON.stringify(v)),wait:(predicate,from=messages.length)=>new Promise((resolve,reject)=>{const poll=setInterval(()=>{const result=messages.slice(from).find(predicate);if(result){clearInterval(poll);clearTimeout(timeout);resolve(result)}},10),timeout=setTimeout(()=>{clearInterval(poll);reject(Error('Studio state update timed out'))},4000)})}}
async function update(c,value,predicate){const from=c.messages.length;c.send(value);return c.wait(predicate,from)}
const person=(state,id)=>state.people.find(p=>p.id===id)
async function enter(c,id,room){return update(c,{type:'studio-enter',room},m=>m.type==='state'&&person(m,id)?.interior===room)}
async function walk(c,id,room,target){const last=c.messages.filter(m=>m.type==='state').at(-1);for(const p of studioRoute(room,person(last,id),target)){await update(c,{type:'studio-move',...p},m=>m.type==='state'&&person(m,id)?.x===p.x&&person(m,id)?.y===p.y);await new Promise(r=>setTimeout(r,30))}}
try{
 const a=await client(),b=await client();const aw=await update(a,{type:'join',room:'studio-test-123',name:'Host'},m=>m.type==='welcome'),bw=await update(b,{type:'join',room:'studio-test-123',name:'Guest'},m=>m.type==='welcome');const initial=await b.wait(m=>m.type==='state'&&m.studio,0);assert.equal(initial.host,aw.id)
 await update(b,{type:'studio-publish',world,revision:0},m=>m.type==='error'&&m.text.includes('host'))
 await update(a,{type:'studio-publish',world:bad,revision:0},m=>m.type==='error'&&m.text.includes('invalid'))
 await update(a,{type:'studio-publish',world,revision:0},m=>m.type==='state'&&m.studioRevision===1&&m.studio)
 await update(a,{type:'studio-publish',world,revision:0},m=>m.type==='error'&&m.text.includes('changed'))
 await enter(a,aw.id,'library');const muted=await update(a,{type:'voice',enabled:true},m=>m.type==='state');assert.equal(person(muted,aw.id).voice,false)
 const seat=world.rooms[0].objects.find(isSeat);await walk(a,aw.id,world.rooms[0],seat);await update(a,{type:'studio-sit',seat:seat.id},m=>m.type==='state'&&person(m,aw.id).seat===seat.id)
 await enter(b,bw.id,'library');await walk(b,bw.id,world.rooms[0],seat);await update(b,{type:'studio-sit',seat:seat.id},m=>m.type==='error'&&m.text.includes('occupied'))
 const prior=person(b.messages.filter(m=>m.type==='state').at(-1),bw.id);b.send({type:'studio-move',x:2,y:2});const after=await update(b,{type:'goal',text:'collision barrier'},m=>m.type==='state'&&person(m,bw.id).goal==='collision barrier');assert.equal(person(after,bw.id).x,prior.x);assert.equal(person(after,bw.id).y,prior.y)
 await enter(a,aw.id,'office');await enter(b,bw.id,'office');await update(a,{type:'voice',enabled:true},m=>m.type==='state'&&person(m,aw.id).voice);await update(b,{type:'voice',enabled:true},m=>m.type==='state'&&person(m,bw.id).voice)
 const signalStart=b.messages.length;a.send({type:'signal',to:bw.id,data:{description:{type:'offer',sdp:'same-room'}}});await b.wait(m=>m.type==='signal'&&m.data.description.sdp==='same-room',signalStart)
 await enter(b,bw.id,'cafe');const barrier=b.messages.length;a.send({type:'signal',to:bw.id,data:{description:{type:'offer',sdp:'cross-room'}}});a.send({type:'chat',text:'signal barrier'});await b.wait(m=>m.type==='chat'&&m.message.text==='signal barrier',barrier);assert.equal(b.messages.slice(barrier).some(m=>m.type==='signal'),false)
 const smaller={...world,rooms:world.rooms.filter(r=>r.id!=='office')};const published=await update(a,{type:'studio-publish',world:smaller,revision:1},m=>m.type==='state'&&m.studioRevision===2);assert.equal(person(published,aw.id).interior,'library');assert.equal(person(published,aw.id).voice,false);assert.equal(person(published,aw.id).seat,'')
 const cursor=b.messages.length;a.ws.close();const transfer=await b.wait(m=>m.type==='state'&&m.host===bw.id,cursor);assert.equal(transfer.people.length,1)
 await update(b,{type:'studio-publish',world,revision:2},m=>m.type==='state'&&m.studioRevision===3)
 await enter(b,bw.id,'');assert.equal(person(b.messages.filter(m=>m.type==='state').at(-1),bw.id).zone,'lounge')
 console.log('Studio checks passed: templates/backups/schema, collision paths and reachable seats, host-only revisioned publishing, live maps, quiet rooms, seating exclusivity, voice isolation, deleted-room relocation and host transfer.')
}finally{for(const ws of clients)ws.terminate();cleanup();await new Promise(r=>server.close(r))}
