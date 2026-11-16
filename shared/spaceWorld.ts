export type Point = {x:number;y:number}
export const zones = [
 {id:'quiet',name:'Quiet library',icon:'📚',caption:'Find your own little corner',x:24,y:38},
 {id:'group',name:'Study studio',icon:'✏️',caption:'Good questions belong here',x:74,y:38},
 {id:'lounge',name:'The commons',icon:'☕',caption:'A break is part of the work',x:24,y:74},
 {id:'meeting',name:'Meeting room',icon:'💬',caption:'Turn a thought into a plan',x:74,y:88}
]
export const furniture = [
 {kind:'shelf',x:8,y:9,w:30,h:5},{kind:'desk',x:10,y:22,w:10,h:6},{kind:'desk',x:30,y:22,w:10,h:6},
 {kind:'table',x:65,y:22,w:20,h:7},{kind:'board',x:67,y:9,w:18,h:4},
 {kind:'sofa',x:9,y:65,w:6,h:15},{kind:'coffee',x:30,y:68,w:10,h:6},{kind:'plant',x:36,y:86,w:5,h:5},
 {kind:'meeting',x:65,y:70,w:20,h:9},{kind:'board',x:67,y:59,w:18,h:4},
 {kind:'plant',x:87,y:12,w:5,h:5},{kind:'plant',x:8,y:86,w:5,h:5}
]
export const walls = [
 ...[4,54].flatMap(x=>[4,54].flatMap(y=>[
  {x,y,w:15,h:1.5},{x:x+27,y,w:15,h:1.5},{x,y,w:1.5,h:40}, {x:x+40.5,y,w:1.5,h:40},
  {x,y:y+40,w:15,h:1.5},{x:x+27,y:y+40,w:15,h:1.5}
 ]))
]
export const zoneAt=(x:number,y:number)=>y<50?(x<50?'quiet':'group'):(x<50?'lounge':'meeting')
export function walkable(x:number,y:number){return x>=2&&x<=98&&y>=2&&y<=98&&![...walls,...furniture].some(r=>x>r.x-.8&&x<r.x+r.w+.8&&y>r.y-.8&&y<r.y+r.h+.8)}
export function canStep(from:Point,to:Point){const distance=Math.hypot(to.x-from.x,to.y-from.y);if(distance>4.1)return false;const steps=Math.max(1,Math.ceil(distance*2));for(let i=1;i<=steps;i++)if(!walkable(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps))return false;return true}
// Breadth-first routes on a small shared grid. A click on furniture chooses the nearest floor tile.
export function route(from:Point,target:Point):Point[]{
 const start={x:Math.round(from.x/2)*2,y:Math.round(from.y/2)*2};const key=(p:Point)=>`${p.x},${p.y}`
 const queue=[start],parents=new Map<string,Point|null>([[key(start),null]]);let best=start,bestDistance=Infinity
 for(let i=0;i<queue.length;i++){const p=queue[i],distance=Math.hypot(p.x-target.x,p.y-target.y);if(distance<bestDistance){best=p;bestDistance=distance}
  if(distance<1)break
  for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2]]){const next={x:p.x+dx,y:p.y+dy};if(!parents.has(key(next))&&canStep(p,next)){parents.set(key(next),p);queue.push(next)}}
 }
 const result:Point[]=[];let current:Point|null=best;while(current&&key(current)!==key(start)){result.unshift(current);current=parents.get(key(current))||null}return result
}
export const canHear=(a:Point&{zone:string;personal?:boolean},b:Point&{zone:string;personal?:boolean})=>!a.personal&&!b.personal&&a.zone===b.zone&&a.zone!=='quiet'&&(a.zone!=='lounge'||Math.hypot(a.x-b.x,a.y-b.y)<=18)

export const seats = [{id:'library-left',x:16,y:32,label:'Library desk 1'},{id:'library-right',x:36,y:32,label:'Library desk 2'},{id:'studio-left',x:68,y:34,label:'Studio desk 1'},{id:'studio-right',x:82,y:34,label:'Studio desk 2'},{id:'office-left',x:70,y:84,label:'Office seat 1'},{id:'office-right',x:82,y:84,label:'Office seat 2'}]
