import assert from 'node:assert/strict'
import {createServer} from 'vite'
const data=new Map([['lifeos.tasks',JSON.stringify([{id:'task-1',title:'Read networking',done:false,category:'Study'}])],['lifeos.journal',JSON.stringify({notes:[{text:'private-diary-secret'}],folders:[]})]])
globalThis.localStorage={getItem:key=>data.get(key)??null};const originalFetch=globalThis.fetch
const server=await createServer({server:{middlewareMode:true},appType:'custom'})
try{
 const {askAI,validateIntent,localEndpoint}=await server.ssrLoadModule('/src/companionAI.ts')
 assert.throws(()=>localEndpoint('https://external.example'),/local Ollama/);assert.throws(()=>validateIntent({op:'execute',value:'code'}),/Unsupported/)
 let payload
 globalThis.fetch=async(url,options)=>{payload=JSON.parse(options.body);return {ok:true,json:async()=>({message:{content:JSON.stringify({text:'Let’s make a study plan.',action:null})}})}}
 const config={enabled:true,endpoint:'http://localhost:11434',model:'test-model'}
 const reply=await askAI(config,'Help me study',['You: I have 20 minutes','Pip: What topic?'],'Study Buddy','Academics',undefined,undefined,'Pip')
 assert.equal(reply.text,'Let’s make a study plan.');assert.match(payload.messages[0].content,/You are Pip/);assert.match(payload.messages[0].content,/Read networking/);assert.doesNotMatch(JSON.stringify(payload),/private-diary-secret/);assert.equal(payload.messages.at(-2).content,'What topic?');assert.equal(payload.messages.at(-1).content,'Help me study')
 const controller=new AbortController();globalThis.fetch=async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true}))
 const pending=askAI(config,'Explain trees',[],'Code Coach','Skills',undefined,controller.signal);controller.abort();await assert.rejects(pending)
 globalThis.fetch=async()=>({ok:true,json:async()=>({message:{content:'not json'}})});await assert.rejects(askAI(config,'Hello',[],'Study Buddy','Home'),/usable reply/)
 console.log('Companion brain checks passed: persona/conversation context, private journal exclusion, local endpoint restriction, validated action types, cancellation and malformed-response handling. A real model was not invoked.')
}finally{globalThis.fetch=originalFetch;await server.close()}
