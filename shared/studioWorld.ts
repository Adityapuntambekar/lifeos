export const catalog={desk:{name:'Work desk',group:'Work',w:3,h:2},chair:{name:'Desk chair',group:'Seating',w:1,h:1},shelf:{name:'Bookcase',group:'Work',w:3,h:1},sofa:{name:'Soft sofa',group:'Seating',w:3,h:1},table:{name:'Meeting table',group:'Work',w:3,h:2},plant:{name:'Leafy plant',group:'Nature',w:1,h:1},rug:{name:'Woven rug',group:'Decor',w:4,h:3},board:{name:'Idea board',group:'Work',w:3,h:1},lamp:{name:'Floor lamp',group:'Decor',w:1,h:1},coffee:{name:'Coffee counter',group:'Social',w:2,h:1},partition:{name:'Room divider',group:'Decor',w:1,h:2}} as const
export type ObjectKind=keyof typeof catalog
export type StudioObject={id:string;kind:ObjectKind;x:number;y:number;rotation:number;color:string}
export const themes={oak:{name:'Warm oak',floor:'#d8b58b',wall:'#f1e4d0',trim:'#9d785a',accent:'#6e9482'},midnight:{name:'Midnight loft',floor:'#738193',wall:'#46546a',trim:'#303b4d',accent:'#b69bd2'},botanical:{name:'Botanical',floor:'#c4cdae',wall:'#e1e9d8',trim:'#738d76',accent:'#759f8b'},rose:{name:'Rose atelier',floor:'#dec1b2',wall:'#f3e2df',trim:'#b28c88',accent:'#c6909e'},coastal:{name:'Coastal',floor:'#d4d8cc',wall:'#e2edf0',trim:'#7e9baf',accent:'#6ca6b7'}} as const
export type StudioRoom={id:string;name:string;template:string;theme:keyof typeof themes;quiet:boolean;objects:StudioObject[]}
export type StudioWorld={version:1;rooms:StudioRoom[]}
export const templateNames={library:'Quiet library',office:'Team office',cafe:'Coffee house',garden:'Garden terrace',studio:'Creative studio',blank:'Blank canvas'}
export const spawn={x:10,y:12}
export function dimensions(o:StudioObject){const c=catalog[o.kind];return o.rotation%180?{w:c.h,h:c.w}:{w:c.w,h:c.h}}
export const isSeat=(o:StudioObject)=>o.kind==='chair'||o.kind==='sofa'
export function covers(o:StudioObject,x:number,y:number){const {w,h}=dimensions(o);return x>=o.x&&x<o.x+w&&y>=o.y&&y<o.y+h}
export function free(room:StudioRoom,x:number,y:number){return Number.isInteger(x)&&Number.isInteger(y)&&x>=1&&x<=18&&y>=2&&y<=12&&!room.objects.some(o=>o.kind!=='rug'&&covers(o,x,y))}
export function placeable(room:StudioRoom,item:StudioObject,ignore=''){const {w,h}=dimensions(item);if(item.x<1||item.y<2||item.x+w>19||item.y+h>12)return false;return !room.objects.some(o=>o.id!==ignore&&o.kind!=='rug'&&item.kind!=='rug'&&(()=>{const d=dimensions(o);return item.x<o.x+d.w&&item.x+w>o.x&&item.y<o.y+d.h&&item.y+h>o.y})())}
export function roomTemplate(kind:keyof typeof templateNames,id:string):StudioRoom{
 const room:StudioRoom={id,name:templateNames[kind],template:kind,theme:kind==='office'?'midnight':kind==='garden'?'botanical':kind==='studio'?'rose':kind==='cafe'?'coastal':'oak',quiet:kind==='library',objects:[]}
 const add=(kind:ObjectKind,x:number,y:number,color='#78958d')=>room.objects.push({id:`${id}-${room.objects.length}`,kind,x,y,rotation:0,color})
 if(kind==='blank')return room
 add('plant',1,2);add('plant',18,2);add('plant',18,10)
 if(kind==='library'){add('shelf',3,2);add('shelf',8,2);add('shelf',13,2);for(const x of [3,12]){add('desk',x,5);add('chair',x+1,7)}add('rug',7,8);add('sofa',7,9);add('lamp',6,9)}
 if(kind==='office'){for(const x of [3,12]){add('desk',x,4,'#89a4b4');add('chair',x+1,6,'#9a8cb4');add('desk',x,8,'#89a4b4');add('chair',x+1,10,'#9a8cb4')}add('board',8,2);add('partition',9,6)}
 if(kind==='cafe'){add('coffee',3,2);add('coffee',5,2);add('shelf',12,2);for(const x of [3,12]){add('table',x,6);add('chair',x+1,5);add('chair',x+1,8)}add('rug',7,8);add('sofa',7,9,'#b78f82')}
 if(kind==='garden'){for(const x of [2,5,8,11,14,17])add('plant',x,2);add('rug',7,5);add('sofa',7,6);add('sofa',7,9);add('table',3,7);add('chair',4,9);add('lamp',13,7)}
 if(kind==='studio'){add('board',3,2);add('board',12,2);add('table',8,5);add('chair',9,4);add('chair',9,7);add('rug',3,8);add('sofa',3,9,'#bd8c9e');add('desk',13,8);add('chair',14,10)}
 return room
}
export const defaultStudio=():StudioWorld=>({version:1,rooms:['library','office','cafe','garden'].map(k=>roomTemplate(k as keyof typeof templateNames,k))})
export function validStudio(v:any):v is StudioWorld {
 if(!v||v.version!==1||!Array.isArray(v.rooms)||!v.rooms.length||v.rooms.length>8)return false
 const ids=new Set<string>()
 for(const r of v.rooms){
  if(!r||typeof r.id!=='string'||!/^[\w-]{1,80}$/.test(r.id)||ids.has(r.id)||typeof r.name!=='string'||!r.name.trim()||r.name.length>60||typeof r.template!=='string'||!Object.hasOwn(themes,r.theme)||typeof r.quiet!=='boolean'||!Array.isArray(r.objects)||r.objects.length>100)return false
  ids.add(r.id);const objects=new Set<string>()
  for(const o of r.objects){if(!o||typeof o.id!=='string'||!/^[\w-]{1,100}$/.test(o.id)||objects.has(o.id)||!Object.hasOwn(catalog,o.kind)||!Number.isInteger(o.x)||!Number.isInteger(o.y)||![0,90,180,270].includes(o.rotation)||typeof o.color!=='string'||!/^#[0-9a-f]{6}$/i.test(o.color))return false;objects.add(o.id)}
  if(!r.objects.every((o:StudioObject)=>placeable(r,o,o.id)))return false
 }
 return true
}
export function studioRoute(room:StudioRoom,from:{x:number;y:number},target:{x:number;y:number}){
 const key=(p:{x:number;y:number})=>p.x+','+p.y,queue=[from],parents=new Map<string,{x:number;y:number}|null>([[key(from),null]]);let best=from,distance=Infinity
 for(let i=0;i<queue.length;i++){const p=queue[i],d=Math.hypot(p.x-target.x,p.y-target.y);if(d<distance){best=p;distance=d}if(d===0)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy};if(!parents.has(key(n))&&free(room,n.x,n.y)){parents.set(key(n),p);queue.push(n)}}}
 const result:{x:number;y:number}[]=[];let p:typeof from|null=best;while(p&&key(p)!==key(from)){result.unshift(p);p=parents.get(key(p))||null}return result
}
