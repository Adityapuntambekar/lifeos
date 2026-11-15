import {newId} from './ids.ts'
import type { Destination } from './companionGuide'

export type Kind='task'|'subject'|'unit'|'skill'|'project'|'university'|'event'|'track'
type Row=Record<string,any>
export type Entity={id:string;kind:Kind;title:string;path:string;page:Destination;key:string;track?:string;parentId?:string;row:Row}
export type Intent={op:'add'|'rename'|'complete'|'delete'|'note';kind?:Kind;parent?:string;title?:string;target?:string;value?:string;date?:string;country?:string;awaiting?:'parent'|'title'|'target'|'value'|'country'|'date'}
export type Reply={text:string;destination?:Destination;focusId?:string;pending?:Intent;confirm?:Intent;changed?:boolean;choices?:{label:string;value:string}[]}
export const stores={task:'lifeos.tasks',subject:'lifeos.academics.subjects',skill:'lifeos.skills.tree',project:'lifeos.skills.projects',university:'lifeos.abroad.unis',event:'lifeos.calendar.events'}
export const workspaceMap={Journal:'Rich-text journaling, Markdown knowledge notes, folders, tags, daily pages, backlinks, local graph and recoverable trash. Journal content is private and not indexed in the companion workspace. Guide navigation only; no journal editing commands yet.',Home:'Personal tasks, current intention, recent journal pages and workspace shortcuts.',Academics:'Semester 5 subject/unit tree, exam readiness, Pomodoro, grade calculator and credit mapper. Other semesters and nested academic topics are not implemented.',Skills:'Programming, AI/ML, Maths & stats, Aptitude recursive learning trees; manual coding stats/problem log; Projects board.',Abroad:'Worldwide country/campus map with Google Earth links and university pipeline; manually rated readiness; budget sandbox; editable research/event journal. No verified admissions database or live research library integration.',Calendar:'Local month and agenda events, JSON backup/restore, ICS/CSV exports. Notification permission only; no scheduled notification delivery or Google two-way sync.',Companions:'Pet templates, local commands, workspace selection context and optional local AI connection.'}
export function describeIntent(plan:Intent){
 const location=(id?:string)=>id?(resolve(id)[0]?.path||id):''
 const target=plan.title||location(plan.target)||plan.kind||'item'
 return `${plan.op==='add'?'Add':plan.op==='rename'?'Rename':plan.op==='delete'?'Delete':plan.op==='complete'?'Complete':'Save note for'} ${target}${plan.parent?` under ${location(plan.parent)}`:''}${plan.value?` → ${plan.value}`:''}${plan.date?` on ${plan.date}`:''}${plan.country?` (${plan.country})`:''}`
}
export const norm=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]/g,'')
export function load<T>(key:string,fallback:T):T{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}
export function indexWorkspace():Entity[]{
 const entities:Entity[]=[]
 const list=(kind:Kind,key:string,page:Destination)=>{for(const row of load<Row[]>(key,[]))entities.push({id:row.id,kind,title:row.title||row.name||'',path:`${page} → ${row.title||row.name}`,page,key,row})}
 list('task',stores.task,'Home');list('subject',stores.subject,'Academics');list('project',stores.project,'Skills');list('university',stores.university,'Abroad');list('event',stores.event,'Calendar')
 for(const subject of entities.filter(e=>e.kind==='subject'))for(const unit of subject.row.units||[])entities.push({id:unit.id,kind:'unit',title:unit.name,path:`${subject.path} → ${unit.name}`,page:'Academics',key:stores.subject,parentId:subject.id,row:unit})
 for(const [track,rows] of Object.entries(load<Record<string,Row[]>>(stores.skill,{}))){const id=`track:${track}`;entities.push({id,kind:'track',title:track,path:`Skills → ${track}`,page:'Skills',key:stores.skill,track,row:{}});const visit=(nodes:Row[],parentId:string,path:string)=>{for(const row of nodes){entities.push({id:row.id,kind:'skill',title:row.title,path:`${path} → ${row.title}`,page:'Skills',key:stores.skill,track,parentId,row});if(row.children)visit(row.children,row.id,`${path} → ${row.title}`)}};visit(rows,id,`Skills → ${track}`)}
 return entities
}
export function resolve(text:string,entities=indexWorkspace()):Entity[]{
 if(!text.trim())return []
 const byId=entities.find(e=>e.id===text);if(byId)return [byId]
 const aliases:Record<string,string>={r:'rprogramming',ml:'introductiontomachinelearning',iot:'internetofthings',agenticsystems:'agentsystems',maths:'mathsstats',coding:'programming',ai:'aiml'}
 const key=aliases[norm(text)]||norm(text)
 const exact=entities.filter(e=>norm(e.title)===key||norm(e.path)===key);if(exact.length)return exact
 return key.length>=3?entities.filter(e=>norm(e.title).includes(key)):[]
}
const clean=(s:string)=>s.trim().replace(/^(?:the|a|an)\s+/i,'').replace(/^(?:as|called|named|titled|call it)\s+/i,'').replace(/^["“]|["”.!?\\]+$/g,'').trim()
const kinds:Record<string,Kind>={unit:'unit',subject:'subject',assignment:'task',task:'task',project:'project',university:'university',event:'event',topic:'skill',subtopic:'skill',subsection:'skill',section:'skill',skill:'skill',category:'skill'}
export function parseIntent(input:string):Intent|null{
 const text=input.trim().replace(/\b(?:please|plz|pls|could you|can you)\b/gi,'').replace(/sub[ -]+topic/gi,'subtopic').replace(/sub[ -]+section/gi,'subsection').replace(/\s+/g,' ').trim()
 const edit=text.match(/\b(rename|delete|remove|complete|finish|mark)\s+(.+?)(?:\s+(?:to|as)\s+(.+))?$/i)
 if(edit){const verb=edit[1].toLowerCase();return {op:verb==='rename'?'rename':/delete|remove/.test(verb)?'delete':'complete',target:clean(edit[2]),value:edit[3]?clean(edit[3]):undefined}}
 const note=text.match(/\b(?:add|save)\s+(?:a\s+)?note\s+(?:to|for|under)\s+(.+?)\s*:\s*(.+)$/i)
 if(note)return {op:'note',target:clean(note[1]),value:note[2]}
 const add=text.match(/\b(?:add|create|make)\s+(?:me\s+)?(?:a\s+|an\s+)?(subtopic|subsection|section|topic|unit|skill|category|subject|assignment|task|project|university|event)\b\s*(.*)$/i)
 if(!add)return null
 const kind=kinds[add[1].toLowerCase()];let rest=add[2].trim();let parent:string|undefined;let title:string|undefined
 const prefix=text.slice(0,add.index).match(/(?:in|under|within|inside)\s+(.+?)\s*$/i)
 if(prefix)parent=clean(prefix[1])
 const parentFirst=rest.match(/^(?:for|in|under|to|within)\s+(.+?)(?:\s+(?:called|named|titled|as)\s+(.+))?$/i)
 const titleFirst=rest.match(/^(.+?)\s+(?:under|in|for|within)\s+(.+)$/i)
 if(parentFirst){parent=clean(parentFirst[1]);title=parentFirst[2]?clean(parentFirst[2]):undefined}
 else if(titleFirst){title=clean(titleFirst[1]);parent=clean(titleFirst[2])}
 else title=clean(rest)||undefined
 return {op:'add',kind,parent,title}
}
function write(key:string,data:unknown){localStorage.setItem(key,JSON.stringify(data));const event=key===stores.skill?'lifeos-skills-updated':key===stores.subject?'lifeos-academics-updated':key===stores.task?'lifeos-tasks-updated':'lifeos-data-updated';window.dispatchEvent(new Event(event));if(event!=='lifeos-data-updated')window.dispatchEvent(new Event('lifeos-data-updated'))}
function locate(value:any,id:string):{row:Row;list:Row[]}|null{if(Array.isArray(value)){for(const row of value){if(row.id===id)return {row,list:value};for(const child of Object.values(row)){if(typeof child==='object'&&child){const result=locate(child,id);if(result)return result}}}}else if(value&&typeof value==='object'){for(const child of Object.values(value)){const result=locate(child,id);if(result)return result}}return null}
function choose(items:Entity[],pending:Intent,field:'target'|'parent'):Reply{return {text:'I found more than one matching item. Choose the exact location:',pending:{...pending,awaiting:field},choices:items.map(e=>({label:e.path,value:e.id}))}}
export function perform(intent:Intent,focusId?:string,confirmed=false):Reply{
 const entities=indexWorkspace();const plan={...intent};const parentQuery=plan.parent&&/^(this|it|here|this section)$/i.test(plan.parent)?focusId:plan.parent||focusId
 if(plan.op!=='add'){
   const matches=resolve(plan.target||focusId||'',entities).filter(e=>e.kind!=='track')
   if(matches.length!==1)return matches.length?choose(matches,plan,'target'):{text:'Which saved item do you mean? Give its name or select it in the workspace.',pending:{...plan,awaiting:'target'}}
   const entity=matches[0];plan.target=entity.id
   if(plan.op==='delete'&&!confirmed)return {text:`Delete ${entity.path}${entity.row.children?.length||entity.row.units?.length?' and its children':''}?`,confirm:plan,destination:entity.page}
   if(plan.op==='rename'&&!plan.value)return {text:`What should I rename “${entity.title}” to?`,pending:{...plan,awaiting:'value'}}
   if(plan.op==='note'&&!plan.value)return {text:'What note should I save?',pending:{...plan,awaiting:'value'}}
   const data=load<any>(entity.key,null);const found=locate(data,entity.id);if(!found)throw new Error('Item no longer exists')
   if(plan.op==='delete')found.list.splice(found.list.indexOf(found.row),1)
   if(plan.op==='rename')found.row[entity.kind==='unit'||entity.kind==='university'?'name':'title']=plan.value
   if(plan.op==='note'){
     if(!['university','event'].includes(entity.kind))return {text:'This item does not yet have an editable notes field in its workspace. I haven’t hidden a note in an unsupported field.'}
     found.row.notes=plan.value
   }
   if(plan.op==='complete'){
     if(entity.kind==='task'||entity.kind==='skill'){const done=(row:Row)=>{row.done=true;row.children?.forEach(done)};done(found.row)}
     else if(entity.kind==='unit'){found.row.complete=true;found.row.status='Done'}
     else if(entity.kind==='project')found.row.status='Done'
     else return {text:'This item does not have a completion checkbox. I haven’t changed its status.'}
   }
   write(entity.key,data);return {text:`Done — ${plan.op==='delete'?'deleted':plan.op==='rename'?'renamed':plan.op==='note'?'saved the note for':'completed'} ${entity.path}.`,destination:entity.page,focusId:plan.op==='delete'?undefined:entity.id,changed:true}
 }
 const kind=plan.kind
 if(!kind)return {text:'What would you like to add: a subject, learning topic, task, project, university or calendar event?',pending:plan}
 let parent:Entity|undefined
 if(kind==='skill'||kind==='unit'){
   const matches=parentQuery?resolve(parentQuery,entities).filter(e=>['track','skill','subject','unit'].includes(e.kind)):[]
   if(matches.length!==1)return matches.length?choose(matches,plan,'parent'):{text:'Where should I add it? Select a learning item, or give a subject, skill track, or parent topic name.',pending:{...plan,awaiting:'parent'}}
   parent=matches[0];plan.parent=parent.id
   if(parent.kind==='unit')return {text:'Academic units don’t yet have a nested topic editor. I can add a unit to its subject, or a subtopic under a Skills item. Nothing changed.'}
 }
 if(!plan.title){if(kind==='task'&&plan.parent)plan.title=`${plan.parent} assignment`;else return {text:`What should I call the new ${kind}${parent?` under ${parent.path}`:''}?`,pending:{...plan,awaiting:'title'}}}
 const title=plan.title!.trim();if(!title||title.length>300)return {text:'Please give it a name between 1 and 300 characters.',pending:{...plan,title:undefined}}
 const id=newId();let row:Row;let key:string;let page:Destination;let data:any;let list:Row[]
 if(parent){key=parent.key;page=parent.page;data=load<any>(key,null);if(parent.kind==='track')list=data[parent.track!];else {const found=locate(data,parent.id);if(!found)throw new Error('Parent no longer exists');if(parent.kind==='subject')list=found.row.units;else{found.row.children??=[];list=found.row.children;found.row.done=false}}row=parent.kind==='subject'?{id,name:title,status:'Not started',complete:false,difficulty:2}:{id,title,done:false}}
 else {
   key=stores[kind as keyof typeof stores];if(!key)return {text:'That item type is not supported yet.'};page=kind==='task'?'Home':kind==='subject'?'Academics':kind==='project'?'Skills':kind==='university'?'Abroad':'Calendar';data=load<Row[]>(key,[]);list=data
   if(kind==='task')row={id,title,category:'Companion',done:false}
   else if(kind==='subject')row={id,title,credits:0,units:[]}
   else if(kind==='project')row={id,title,stack:'',status:'Planned',metric:'',ready:false}
   else if(kind==='university'){
     if(!plan.country?.trim())return {text:`Which country is “${title}” in?`,pending:{...plan,awaiting:'country'}}
     row={id,name:title,city:'Set city',country:plan.country,programmes:'Verify on official site',stage:'Known about',fit:0,notes:'',requirements:'Verify on official site',lat:plan.country==='Sweden'?58:56,lng:plan.country==='Sweden'?15:10,saved:false}
   }else{
     if(!plan.date||!/^\d{4}-\d{2}-\d{2}$/.test(plan.date)||Number.isNaN(Date.parse(plan.date))||new Date(plan.date).toISOString().slice(0,10)!==plan.date)return {text:`What date is “${title}”? Use YYYY-MM-DD.`,pending:{...plan,awaiting:'date'}}
     row={id,title,date:plan.date,time:'',type:'Personal',notes:''}
   }
 }
 if(list.some(e=>norm(e.title||e.name||'')===norm(title)))return {text:`“${title}” already exists there. I haven’t added a duplicate.`,destination:page}
 list.push(row);write(key,data)
 if(parent?.track)localStorage.setItem('lifeos.skills.activeTab',parent.track)
 if(parent?.track)window.dispatchEvent(new Event('lifeos-skills-updated'))
 return {text:`Done — added “${title}” in ${parent?parent.path:page}.`,destination:page,focusId:id,changed:true}
}
export function continueIntent(plan:Intent,answer:string):Intent{
 if(plan.awaiting){const field=plan.awaiting;return {...plan,[field]:field==='title'||field==='value'?clean(answer):answer,awaiting:undefined}}
 if(plan.op!=='add'){if(!plan.target)return {...plan,target:answer};return {...plan,value:clean(answer)}}
 if((plan.kind==='skill'||plan.kind==='unit')&&!plan.parent)return {...plan,parent:answer}
 if(!plan.title)return {...plan,title:clean(answer)}
 if(plan.kind==='university'&&!plan.country)return {...plan,country:/denmark/i.test(answer)?'Denmark':/sweden/i.test(answer)?'Sweden':answer}
 if(plan.kind==='event'&&!plan.date)return {...plan,date:answer.trim()}
 return {...plan,parent:answer}
}
export const roleInstructions:Record<string,string>={
 'Study Buddy':'Help with learning across Academics, Skills, Projects, research and study-abroad prerequisites. Ask about goals, break work into manageable steps, explain and quiz. Never restrict study help to R or AI/ML.',
 'Code Coach':'Coach programming, problem solving and technical projects. Give hints and explanations matched to the user’s tracked skills.',
 'Abroad Guide':'Use saved university, readiness and budget data. Separate saved facts from unverified admission requirements. Never invent fees or eligibility.',
 'Planner Pal':'Help schedule tasks, events and study blocks using saved dates. Ask before assuming a deadline.',
 'Research Raccoon':'Help plan literature reading, experiments and writing. Do not fabricate papers, citations or results.',
 'Break Pal':'Give gentle break suggestions and encouragement; do not claim to measure health or mood.'}
export function workspaceAnswer(question:string,role:string,page:string,focusId?:string):Reply|null{
 const entities=indexWorkspace();const q=question.toLowerCase()
 if(/what.*(can you|do you do)|^help$/.test(q))return {text:`${roleInstructions[role]||'I help organise your LifeOS work.'} I can find saved items across every workspace; add subjects, nested skills, assignments, projects, universities and events; rename or complete supported items; and confirm deletions. Select a parent item then say “in this add subtopic …”. Connect an AI model for free-form teaching and conversation.`}
 if(/where am i|this page|this section|selected/.test(q)){const selected=entities.find(e=>e.id===focusId);return {text:`You’re in ${page}.${selected?` Selected: ${selected.path}.`:' Select a subject or learning item to give “this” a precise meaning.'}`}}
 if(/^(list|show|find|search|what|how many|where)/.test(q)){
   const kind=/universit/.test(q)?'university':/project/.test(q)?'project':/assignment|task/.test(q)?'task':/subject/.test(q)?'subject':/calendar|event/.test(q)?'event':null
   const matches=kind?entities.filter(e=>e.kind===kind):entities.filter(e=>norm(question).includes(norm(e.title))&&norm(e.title).length>2)
   if(matches.length)return {text:matches.slice(0,12).map(e=>`${e.path}${e.row.done||e.row.complete?' · Done':''}${e.row.date?` · ${e.row.date}`:''}`).join('\n')+(matches.length>12?`\n…and ${matches.length-12} more.`:''),destination:matches[0].page,focusId:matches.length===1?matches[0].id:undefined}
 }
 return null
}
