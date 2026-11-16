import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {mkdtempSync,rmSync,existsSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {resolve,join} from 'node:path'
import {WebSocket} from 'ws'
const root=resolve('outputs/LifeOS-Windows-Beta-2026-11-17'),directory=mkdtempSync(join(tmpdir(),'lifeos-release-'))
for(const excluded of ['data','work','.env','.git','src'])assert.equal(existsSync(join(root,excluded)),false)
const child=spawn(join(root,'node.exe'),['server/start.mjs'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:'4199',LIFEOS_DATA_DIR:directory},stdio:['ignore','pipe','pipe'],windowsHide:true});let logs='';child.stderr.on('data',v=>logs+=v)
const clients=[]
try{
 let ready=false;for(let i=0;i<80;i++){try{const response=await fetch('http://127.0.0.1:4199/healthz');if(response.ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100))}assert.ok(ready,logs)
 for(const path of ['/','/manifest.webmanifest','/sw.js','/api/ice']){const response=await fetch('http://127.0.0.1:4199'+path);assert.equal(response.status,200,path)}
 for(const name of ['Host','Friend']){const ws=new WebSocket('ws://127.0.0.1:4199/space');clients.push(ws);await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('No multiplayer welcome')),3000);ws.once('error',reject);ws.once('open',()=>ws.send(JSON.stringify({type:'join',room:'release-check',name,identity:(name==='Host'?'a':'b').repeat(64)})));ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='state'&&m.people.length===clients.length){clearTimeout(timeout);resolve()}})})}
 assert.ok(existsSync(join(directory,'release-check.json')));console.log('Portable release passed: bundled Node boots, app/PWA/ICE/health served, two clients join shared room, durable map created, private source/data excluded.')
}finally{clients.forEach(ws=>ws.terminate());child.kill();await new Promise(r=>child.once('exit',r));rmSync(directory,{recursive:true,force:true})}
