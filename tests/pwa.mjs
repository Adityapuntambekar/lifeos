import assert from 'node:assert/strict'
import {readFile,access} from 'node:fs/promises'
import vm from 'node:vm'
const handlers={},cache=new Map();let activeCache='',offline=false,claimed=false,skipped=false
const context={URL,fetch:async()=>{if(offline)throw Error('offline');return 'network'},caches:{open:async name=>{activeCache=name;return {addAll:async urls=>{for(const url of urls){await access('dist'+url);cache.set(url,'cached:'+url)}},match:async url=>cache.get(url)}},keys:async()=>['unrelated-cache'],delete:async()=>{throw Error('Must not remove unrelated caches')}},self:{location:{origin:'https://lifeos.test'},addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{claimed=true}},skipWaiting:()=>{skipped=true}}}
vm.runInNewContext(await readFile('dist/sw.js','utf8'),context)
let waiting;handlers.install({waitUntil:p=>waiting=p});await waiting;assert.ok(activeCache.startsWith('lifeos-shell-'));assert.ok(cache.size>=5)
handlers.activate({waitUntil:p=>waiting=p});await waiting;assert.ok(claimed)
offline=true;let response;handlers.fetch({request:{method:'GET',url:'https://lifeos.test/?room=invite',mode:'navigate'},respondWith:p=>response=p});assert.equal(await response,'cached:/index.html')
for(const url of ['https://maps.google.com/maps','https://lifeos.test/space']){let handled=false;handlers.fetch({request:{method:'GET',url},respondWith:()=>handled=true});assert.equal(handled,false)}
handlers.message({data:'ACTIVATE_UPDATE'});assert.ok(skipped)
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));for(const icon of manifest.icons){const png=await readFile('dist'+icon.src);assert.equal(png.readUInt32BE(16),Number(icon.sizes.split('x')[0]))}
console.log('PWA tests passed: complete precache, offline navigation, external/live bypass, update activation and icon sizes.')
