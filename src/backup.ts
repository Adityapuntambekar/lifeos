import {validHome} from './homeLayout.ts'
import {validJournal} from './journalModel.ts'
type Rule=(value:any)=>boolean
const str:Rule=v=>typeof v==='string',num:Rule=v=>typeof v==='number'&&Number.isFinite(v),bool:Rule=v=>typeof v==='boolean'
const obj:Rule=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const shape=(fields:Record<string,Rule>):Rule=>v=>obj(v)&&Object.entries(fields).every(([k,rule])=>rule(v[k]))
const list=(rule:Rule):Rule=>v=>Array.isArray(v)&&v.length<=10000&&v.every(rule)
const records=(fields:Record<string,Rule>)=>list(shape({id:str,...fields}))
const node:Rule=v=>shape({id:str,title:str})(v)&&(v.done===undefined||bool(v.done))&&(v.children===undefined||list(node)(v.children))
const rules:Record<string,Rule>={
 'lifeos.home.layout':validHome,
 'lifeos.journal':validJournal,'lifeos.profile':shape({name:str,workspace:str}),'lifeos.intention':str,
 'lifeos.tasks':records({title:str,category:str,done:bool}),
 'lifeos.calendar.events':records({title:str,date:v=>str(v)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v)),time:str,type:str,notes:str}),
 'lifeos.academics.subjects':records({title:str,credits:num,units:records({name:str,status:str,complete:bool,difficulty:num})}),
 'lifeos.academics.grades':records({subject:str,credits:num,point:num}),
 'lifeos.academics.sgpas':list(num),'lifeos.academics.minutes':num,
 'lifeos.skills.tree':shape(Object.fromEntries(['Programming','AI / ML','Maths & stats','Aptitude'].map(k=>[k,list(node)]))),
 'lifeos.skills.problems':records({title:str,topic:str,difficulty:str,date:str,status:str}),
 'lifeos.skills.projects':records({title:str,stack:str,status:str,metric:str,ready:bool}),
 'lifeos.skills.stats':shape({username:str,easy:num,medium:num,hard:num,streak:num,rating:num}),
 'lifeos.abroad.unis':records({name:str,city:str,country:str,programmes:str,stage:str,fit:num,notes:str,requirements:str,lat:num,lng:num,saved:bool}),
 'lifeos.abroad.readiness':v=>Array.isArray(v)&&v.length>0&&records({label:str,value:num})(v),
 'lifeos.abroad.budget':shape({tuition:num,housing:num,food:num,transport:num,scholarship:num,exchange:num}),
 'lifeos.abroad.funds':num,'lifeos.abroad.researchNotes':str,'lifeos.abroad.selected':str,
 'lifeos.companions.buddies':records({name:str,role:str,emoji:str,skin:str,mood:str,line:str}),
 'lifeos.companions.chat':list(str),'lifeos.companions.selected':str,'lifeos.companions.visible':bool,
 'lifeos.skills.activeTab':v=>['Programming','AI / ML','Maths & stats','Aptitude','Projects'].includes(v),
 'lifeos.theme':v=>['nordic','lavender','matcha','sakura','midnight'].includes(v)
}
export function parseBackup(text:string){
 if(text.length>5_000_000)throw new Error('Choose a backup smaller than 5 MB.')
 const parsed=JSON.parse(text);if(!obj(parsed))throw new Error('A backup must contain an object of saved sections.')
 const data=parsed.format==='lifeos-backup'?(parsed.version===1?parsed.data:null):parsed
 if(!obj(data))throw new Error('Unsupported backup version or missing data.')
 const accepted:Record<string,unknown>={},skipped:string[]=[]
 for(const [key,value] of Object.entries(data)){if(!rules[key]){skipped.push(key);continue}if(!rules[key](value))throw new Error(`Invalid data in ${key}. Nothing has been changed.`);accepted[key]=value}
 if(!Object.keys(accepted).length)throw new Error('No supported LifeOS sections found.')
 return {data:accepted,skipped}
}
export function makeBackup(storage:Storage){const data:Record<string,unknown>={};for(let i=0;i<storage.length;i++){const key=storage.key(i)!;if(rules[key]){const raw=storage.getItem(key);if(raw!==null){try{data[key]=key==='lifeos.skills.activeTab'?raw:JSON.parse(raw)}catch{throw new Error(`Could not back up ${key}; its saved data is damaged.`)}}}}return JSON.stringify({format:'lifeos-backup',version:1,createdAt:new Date().toISOString(),data},null,2)}
export function applyBackup(storage:Storage,data:Record<string,unknown>){
 const validated=parseBackup(JSON.stringify(data)).data
 const before=Object.fromEntries(Object.keys(validated).map(key=>[key,storage.getItem(key)]))
 try{for(const [key,value] of Object.entries(validated))storage.setItem(key,key==='lifeos.skills.activeTab'?String(value):JSON.stringify(value))}
 catch(error){for(const key of Object.keys(validated))storage.removeItem(key);for(const [key,value] of Object.entries(before))if(value!==null)storage.setItem(key,value);throw new Error('Restore failed, possibly because storage is full. Previous values were restored.')}
}
export function downloadBackup(storage:Storage){const blob=new Blob([makeBackup(storage)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`lifeos-backup-${new Date().toISOString().replaceAll(':','-')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
