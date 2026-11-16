import {linkedTitles,normalizeTitle,type JournalNote} from './journalModel.ts'
export function noteGraph(notes:JournalNote[]){
 const nodes=notes.filter(n=>n.mode==='knowledge'&&!n.deleted),titles=new Map(nodes.map(n=>[normalizeTitle(n.title),n.id]));const seen=new Set<string>();const edges:{from:string;to:string}[]=[],missing:{from:string;title:string}[]=[]
 for(const n of nodes)for(const title of linkedTitles(n.body)){const to=titles.get(normalizeTitle(title));if(to){const key=JSON.stringify([n.id,to]);if(to!==n.id&&!seen.has(key)){seen.add(key);edges.push({from:n.id,to})}}else missing.push({from:n.id,title})}
 return {nodes,edges,missing}
}
export function neighborhood(edges:{from:string;to:string}[],id:string,depth:number){const found=new Set([id]);for(let d=0;d<depth;d++){const previous=new Set(found);for(const e of edges){if(previous.has(e.from))found.add(e.to);if(previous.has(e.to))found.add(e.from)}}return found}
export function graphPositions(ids:string[],edges:{from:string;to:string}[]){
 const points=ids.map((id,i)=>({id,x:400+Math.cos(i*2.399)*Math.sqrt(i+1)*25,y:260+Math.sin(i*2.399)*Math.sqrt(i+1)*18})),byId=new Map(points.map(p=>[p.id,p]));
 for(let step=0;step<100;step++){for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.max(5,Math.hypot(dx,dy)),force=Math.min(3,350/(d*d));a.x+=dx/d*force;a.y+=dy/d*force;b.x-=dx/d*force;b.y-=dy/d*force}for(const e of edges){const a=byId.get(e.from),b=byId.get(e.to);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-95)*.025;a.x+=dx/d*f;a.y+=dy/d*f;b.x-=dx/d*f;b.y-=dy/d*f}for(const p of points){p.x=Math.max(40,Math.min(760,p.x+(400-p.x)*.002));p.y=Math.max(40,Math.min(480,p.y+(260-p.y)*.002))}}
 return Object.fromEntries(points.map(p=>[p.id,{x:p.x,y:p.y}]))
}
