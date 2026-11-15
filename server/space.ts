import {WebSocketServer,WebSocket} from 'ws'
import type {Server} from 'node:http'
import {randomUUID} from 'node:crypto'
type Person={id:string;name:string;color:string;x:number;y:number;zone:string;voice:boolean;status:string}
type Room={peers:Map<WebSocket,Person>;messages:{name:string;text:string;zone:string;id:string}[];board:string;timers:Record<string,number>}
export const zoneAt=(x:number,y:number)=>y<50?(x<50?'quiet':'group'):(x<50?'lounge':'meeting')
export function attachSpace(server:Server){
 const wss=new WebSocketServer({noServer:true,maxPayload:65536});const rooms=new Map<string,Room>()
 const upgrade=(req:any,socket:any,head:any)=>{if(req.url?.split('?')[0]==='/space')wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req))}
 server.on('upgrade',upgrade)
 const send=(ws:WebSocket,data:unknown)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data))}
 const state=(room:Room)=>{const data={type:'state',people:[...room.peers.values()],board:room.board,timers:room.timers};for(const ws of room.peers.keys())send(ws,data)}
 wss.on('connection',ws=>{
  let room:Room|undefined,key='',person:Person|undefined;let count=0,windowStart=Date.now()
  ws.on('message',raw=>{try{
   if(Date.now()-windowStart>1000){count=0;windowStart=Date.now()}if(++count>40)return
   const m=JSON.parse(raw.toString())
   if(m.type==='join'&&!room){if(typeof m.room!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(m.room)||typeof m.name!=='string'||!m.name.trim())return send(ws,{type:'error',text:'Enter your name and a valid invite code.'})
    key=m.room;room=rooms.get(key);if(!room){room={peers:new Map(),messages:[],board:'Welcome! What are we working on today?',timers:{}};rooms.set(key,room)}
    if(room.peers.size>=12){room=undefined;return send(ws,{type:'error',text:'This space is full (12 people).'})}
    person={id:randomUUID(),name:m.name.trim().slice(0,28),color:/^#[0-9a-f]{6}$/i.test(m.color)?m.color:'#8569c4',x:25,y:75,zone:'lounge',voice:false,status:'Available'};room.peers.set(ws,person);send(ws,{type:'welcome',id:person.id,messages:room.messages});state(room);return
   }
   if(!room||!person)return
   if(m.type==='move'&&Number.isFinite(m.x)&&Number.isFinite(m.y)){person.x=Math.min(96,Math.max(4,m.x));person.y=Math.min(94,Math.max(8,m.y));const next=zoneAt(person.x,person.y);if(next!==person.zone)person.voice=false;person.zone=next;state(room)}
   if(m.type==='voice'){person.voice=m.enabled===true&&person.zone!=='quiet';state(room)}
   if(m.type==='status'&&['Available','Focusing','On a break'].includes(m.value)){person.status=m.value;state(room)}
   if(m.type==='chat'&&typeof m.text==='string'&&m.text.trim()){const msg={id:randomUUID(),name:person.name,text:m.text.trim().slice(0,800),zone:person.zone};room.messages.push(msg);room.messages=room.messages.slice(-100);for(const client of room.peers.keys())send(client,{type:'chat',message:msg})}
   if(m.type==='board'&&typeof m.text==='string'){room.board=m.text.slice(0,3000);state(room)}
   if(m.type==='timer'){room.timers[person.zone]=m.stop?0:Date.now()+25*60*1000;state(room)}
   if(m.type==='signal'&&typeof m.to==='string'&&m.data){const recipient=[...room.peers.entries()].find(([,p])=>p.id===m.to&&p.zone===person!.zone&&p.voice&&person!.voice);if(recipient)send(recipient[0],{type:'signal',from:person.id,data:m.data})}
  }catch{send(ws,{type:'error',text:'That message could not be processed.'})}})
  ws.on('close',()=>{if(room){room.peers.delete(ws);if(!room.peers.size)rooms.delete(key);else state(room)}})
  ws.on('error',()=>{})
 })
 return ()=>{server.off('upgrade',upgrade);for(const client of wss.clients)client.terminate();wss.close()}
}
