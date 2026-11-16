import {mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawn} from 'node:child_process'
import {WebSocket} from 'ws'
import assert from 'node:assert/strict'
async function smoke(args,port){
 const directory=mkdtempSync(join(tmpdir(),'lifeos-host-'))
 const child=spawn(process.execPath,args,{env:{...process.env,PORT:String(port),LIFEOS_DATA_DIR:directory},stdio:['ignore','pipe','pipe'],windowsHide:true})
 let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d)
 try{
  await new Promise((resolve,reject)=>{const deadline=Date.now()+10000;const poll=setInterval(async()=>{try{const response=await fetch(`http://127.0.0.1:${port}`);if(response.ok){clearInterval(poll);resolve()}}catch{}if(Date.now()>deadline){clearInterval(poll);reject(new Error(logs))}},150)})
  const ws=new WebSocket(`ws://127.0.0.1:${port}/space`)
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.terminate();reject(new Error('WebSocket route timeout'))},3000);ws.on('open',()=>ws.send(JSON.stringify({type:'join',room:'hosting-smoke-test',name:'Check',identity:'a'.repeat(64)})));ws.on('message',raw=>{const message=JSON.parse(raw);if(message.type==='welcome'){assert.ok(message.id);clearTimeout(timer);ws.close();resolve()}});ws.on('error',reject)})
 }finally{child.kill();await new Promise(resolve=>child.once('exit',resolve));rmSync(directory,{recursive:true,force:true})}
}
await smoke(['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5189','--strictPort'],5189)
await smoke(['--experimental-strip-types','server/start.mjs'],4198)
console.log('Development and production HTTP/WebSocket hosting smoke checks passed.')
