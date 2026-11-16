export type SearchPage='Home'|'Journal'|'Academics'|'Skills'|'Abroad'|'Calendar'|'Space'|'Companions'
export type SearchItem={key:string;id:string;page:SearchPage;kind:string;title:string;path:string;text:string;updated:number}
type Reader=Pick<Storage,'getItem'>
const text=(v:unknown)=>typeof v==='string'?v:''
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const rows=(v:unknown):Record<string,any>[]=>Array.isArray(v)?v.filter(object):[]
export function buildSearchIndex(storage:Reader){
 const items:SearchItem[]=[],warnings:string[]=[]
 const read=(key:string)=>{try{const raw=storage.getItem(key);return raw?JSON.parse(raw):null}catch{warnings.push(key);return null}}
 const add=(row:Record<string,any>,page:SearchPage,kind:string,path:string,body:string)=>{const id=text(row.id),title=text(row.title)||text(row.name);if(!id||!title)return;items.push({key:`${page}:${kind}:${id}`,id,page,kind,title,path,text:body,updated:typeof row.updated==='number'?row.updated:0})}
 for(const page of ['Home','Journal','Academics','Skills','Abroad','Calendar','Space','Companions'] as SearchPage[])items.push({key:'page:'+page,id:'',page,kind:'Workspace',title:page,path:'Open workspace',text:{Home:'tasks intention dashboard',Journal:'notes writing diary Markdown',Academics:'subjects units grades exams',Skills:'learning projects',Abroad:'universities countries maps',Calendar:'events dates schedule',Space:'study garden friends meeting',Companions:'pets buddies guide'}[page],updated:0})
 for(const row of rows(read('lifeos.tasks')))add(row,'Home','Task',`Home · ${text(row.category)||'Tasks'}${row.done?' · Completed':''}`,[row.category,row.due].map(text).join(' '))
 const journal=read('lifeos.journal');if(object(journal)){for(const note of rows(journal.notes)){if(note.deleted!==null&&note.deleted!==undefined)continue;const folder=rows(journal.folders).find(f=>f.id===note.folder);add(note,'Journal',note.mode==='knowledge'?'Knowledge note':'Journal page',`Journal · ${text(folder?.name)||'All notes'}`,[text(note.text),...Array.isArray(note.tags)?note.tags.filter((t:unknown)=>typeof t==='string'):[]].join(' '))}}
 for(const subject of rows(read('lifeos.academics.subjects'))){add(subject,'Academics','Subject','Academics · Subjects',text(subject.examDate));for(const unit of rows(subject.units))add(unit,'Academics','Unit',`Academics · ${text(subject.title)}`,text(unit.status))}
 const tree=read('lifeos.skills.tree');if(object(tree)){const visit=(nodes:unknown,path:string,depth=0)=>{if(depth>30)return;for(const node of rows(nodes)){add(node,'Skills','Learning topic',path,'');visit(node.children,path+' · '+text(node.title),depth+1)}};for(const [track,nodes] of Object.entries(tree))visit(nodes,'Skills · '+track)}
 for(const row of rows(read('lifeos.skills.projects')))add(row,'Skills','Project',`Skills · Projects · ${text(row.status)}`,[row.stack,row.metric].map(text).join(' '))
 for(const row of rows(read('lifeos.abroad.unis')))add(row,'Abroad','University',`Abroad · ${text(row.country)} · ${text(row.city)}`,[row.country,row.city,row.programmes,row.notes,row.requirements].map(text).join(' '))
 for(const row of rows(read('lifeos.calendar.events')))add(row,'Calendar','Event',`Calendar · ${text(row.date)} · ${text(row.time)}`,[row.date,row.type,row.notes].map(text).join(' '))
 return {items,warnings}
}
export const normalizeSearch=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase()
export function searchItems(items:SearchItem[],query:string,page:SearchPage|'All'='All'){
 const q=normalizeSearch(query.trim()),words=q.split(/\s+/).filter(Boolean)
 return items.filter(i=>page==='All'||i.page===page).map(item=>{const title=normalizeSearch(item.title),body=normalizeSearch(`${item.title} ${item.path} ${item.text}`);if(!words.every(w=>body.includes(w)))return {item,score:-1};return {item,score:!q?(item.kind==='Workspace'?100:0):title===q?100:title.startsWith(q)?80:title.includes(q)?60:words.every(w=>title.includes(w))?40:10}}).filter(r=>r.score>=0).sort((a,b)=>b.score-a.score||b.item.updated-a.item.updated||a.item.title.localeCompare(b.item.title)).map(r=>r.item)
}
export function searchSnippet(item:SearchItem,query:string){const body=item.text.replace(/\s+/g,' ').trim();const word=query.trim().split(/\s+/).find(w=>normalizeSearch(body).includes(normalizeSearch(w)));const at=word?normalizeSearch(body).indexOf(normalizeSearch(word)):0,start=Math.max(0,at-45);return (start?'…':'')+body.slice(start,start+150)+(body.length>start+150?'…':'')}
