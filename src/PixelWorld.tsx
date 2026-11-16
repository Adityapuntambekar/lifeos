import {useEffect,useRef} from 'react'
import {themes,catalog,type StudioRoom} from '../shared/studioWorld'
import StudioArt from './StudioArt'
// Rendering is deliberately separate from authoritative geometry and interaction.
export default function PixelWorld({room,grid}:{room:StudioRoom;grid:boolean}){
 const ref=useRef<HTMLCanvasElement>(null),supported=typeof CanvasRenderingContext2D!=='undefined'
 useEffect(()=>{if(!supported)return;const c=ref.current?.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;const t=themes[room.theme],tile=32
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
 rect(0,0,640,448,t.trim)
 for(let y=1;y<14;y++)for(let x=0;x<20;x++){rect(x*tile+2,y*tile,30,31,t.floor);rect(x*tile+3,y*tile+29,28,1,'#6a503521');if((x+y)%3===0)rect(x*tile+8,y*tile+14,12,1,'#ffffff22')}
 rect(16,20,608,42,t.wall);rect(16,58,608,5,t.trim);rect(16,64,9,360,t.wall);rect(615,64,9,360,t.wall)
 for(const x of [76,276,476]){rect(x-4,21,96,34,t.trim);rect(x,23,88,28,'#a7cad1');rect(x+3,25,38,10,'#dcebe4');rect(x+42,23,3,28,t.wall);rect(x,36,88,2,t.wall);rect(x-5,53,98,5,t.wall);for(let i=0;i<5;i++)rect(x+8+i*5,64+i*8,65,8,'#fff4c51a')}
 const draw=(o:StudioRoom['objects'][number])=>{const a=catalog[o.kind],W=a.w*32,H=a.h*32;c.save();c.translate(o.x*32,o.y*32);if(o.rotation===90){c.translate(H,0);c.rotate(Math.PI/2)}if(o.rotation===180){c.translate(W,H);c.rotate(Math.PI)}if(o.rotation===270){c.translate(0,W);c.rotate(-Math.PI/2)}
 if(o.kind==='rug'){rect(2,2,W-4,H-4,o.color+'80');rect(7,7,W-14,2,'#fff7');rect(7,H-9,W-14,2,'#fff7');for(let i=10;i<W-10;i+=10){rect(i,1,3,3,'#e9d8bb');rect(i,H-4,3,3,'#e9d8bb')}c.restore();return}
 rect(3,8,W-5,H-9,'#25363138')
 if(o.kind==='plant'){rect(10,19,15,11,'#9d654d');rect(12,21,11,7,'#c5906a');rect(16,8,3,15,'#467c52');for(const [x,y,w,h,col] of [[6,8,12,8,'#5e9962'],[16,3,11,10,'#83ac6a'],[5,17,12,6,'#38754f'],[19,14,10,7,'#6b9c61']] as [number,number,number,number,string][])rect(x,y,w,h,col)}
 else if(o.kind==='chair'){rect(5,2,22,7,'#3c5261');rect(4,8,24,15,o.color);rect(7,10,18,9,'#ffffff25');rect(14,24,3,5,'#46515c');rect(8,29,16,2,'#46515c')}
 else if(o.kind==='sofa'){rect(2,2,W-4,25,o.color);rect(2,2,W-4,6,'#24374144');rect(1,7,6,22,o.color);rect(W-7,7,6,22,o.color);for(let i=0;i<3;i++)rect(9+i*26,10,23,15,'#ffffff25');rect(10,10,11,10,'#dfbd98');rect(6,29,5,3,'#5a4a42');rect(W-11,29,5,3,'#5a4a42')}
 else if(o.kind==='shelf'){rect(1,1,W-2,28,'#785440');for(let i=0;i<14;i++){rect(5+i*6,4,4,17+i%3*2,['#89a6aa','#ba8070','#ccae73','#8b9b71'][i%4]);rect(5+i*6,8,4,1,'#fff5')}rect(1,26,W-2,4,'#c5996c')}
 else if(o.kind==='board'){rect(2,1,W-4,27,'#8d7866');rect(5,4,W-10,21,'#eee8d7');for(let i=0;i<4;i++)rect(10+i*19,8,12,10,['#dbbc82','#9cb5a5','#b8a3c7','#dbbc82'][i]);rect(8,26,W-16,3,'#667f82')}
 else if(o.kind==='lamp'){rect(10,26,16,4,'#5b6866');rect(17,10,3,17,'#6a736b');rect(11,3,15,4,'#e4c67b');rect(7,7,23,8,'#f3dda5');rect(9,15,19,2,'#ad945f')}
 else if(o.kind==='partition'){rect(5,1,22,H-2,'#445c59');rect(7,3,18,H-7,o.color);for(let y=5;y<H-6;y+=8)rect(8,y,16,1,'#fff3')}
 else {rect(3,6,W-6,H-10,'#936a50');rect(3,2,W-6,H-12,'#d3a97c');rect(6,4,W-12,2,'#edcba0');if(o.kind==='coffee'){rect(9,7,21,16,'#536f78');rect(12,8,15,7,'#abc8cc');rect(15,19,8,5,'#f8ead0');rect(43,12,10,9,'#f2dfbf');rect(45,13,6,4,'#815d44')}else{rect(19,9,30,20,'#405a65');rect(22,11,24,14,'#9dbec4');rect(31,29,5,5,'#657b80');rect(16,35,37,5,'#dce1d6');for(let y=36;y<40;y+=2)for(let x=18;x<51;x+=4)rect(x,y,2,1,'#8b9a9b');rect(W-28,13,14,19,'#f2e6ce');rect(W-25,17,8,1,'#aeb6ab');rect(W-25,21,8,1,'#aeb6ab');rect(W-26,H-23,10,8,'#92705b');rect(W-24,H-22,6,3,'#503b32')}}c.restore()}
 room.objects.filter(o=>o.kind==='rug').forEach(draw);room.objects.filter(o=>o.kind!=='rug').sort((a,b)=>a.y-b.y).forEach(draw)
 for(const x of [25,572]){rect(x,385,43,33,t.trim);rect(x+4,388,35,27,'#373d3b');rect(x+7,390,29,23,'#58766a');rect(x+17,397,10,3,'#e2e6cf');rect(x+14,400,10,3,'#e2e6cf');rect(x+17,403,10,3,'#e2e6cf')}
 if(grid){for(let x=32;x<640;x+=32)rect(x,64,1,352,'#ffffff44');for(let y=64;y<448;y+=32)rect(32,y,576,1,'#ffffff44')}
 },[room,supported,grid])
 return supported?<canvas ref={ref} width={640} height={448} className="pixel-world" aria-hidden="true"/>:<svg viewBox="0 0 800 560" aria-hidden="true"><StudioArt room={room} grid={grid}/></svg>
}
