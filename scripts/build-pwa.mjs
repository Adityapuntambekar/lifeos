import {readFile,writeFile,readdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {deflateSync} from 'node:zlib'
// Generate simple original leaf/book icons without a runtime graphics dependency.
const crc=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
const chunk=(type,data)=>{const name=Buffer.from(type),size=Buffer.alloc(4),sum=Buffer.alloc(4);size.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([size,name,data,sum])}
for(const size of [192,512]){const pixels=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*(size*4+1)+1+x*4,u=x/size,v=y/size;let color=[51,83,78];if(u>.25&&u<.75&&v>.32&&v<.7)color=u<.49?[224,234,206]:[190,213,189];if(Math.abs(u-.5)<.012&&v>.31&&v<.73)color=[113,155,132];if(((u-.61)/.13)**2+((v-.23)/.065)**2<1)color=[178,209,163];pixels.set([...color,255],i)}const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;await writeFile(`dist/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]))}
const files=['/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png',...(await readdir('dist/assets')).map(f=>'/assets/'+f)]
const hash=createHash('sha256');for(const f of files)hash.update(await readFile('dist'+f));const version=hash.digest('hex').slice(0,14)
await writeFile('dist/sw.js',`const CACHE='lifeos-shell-${version}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('lifeos-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname==='/space')return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html'))));return}
if(FILES.includes(url.pathname))event.respondWith(caches.open(CACHE).then(cache=>cache.match(url.pathname)).then(cached=>cached||fetch(event.request)));
});`)
console.log('Generated versioned offline shell and app icons:',version)
