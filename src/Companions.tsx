import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { seedTree, defaultProjects } from './Skills'
import { seededSubjects } from './Academics'
import { seededUniversities } from './Abroad'
import { seeds as calendarSeeds } from './Calendar'
import { guide, type Destination } from './companionGuide'
import './companionGlobal.css'
import { describeIntent, indexWorkspace, parseIntent, perform, continueIntent, workspaceAnswer, type Intent, type Reply } from './companionWorkspace'
import { askAI, defaultAI, type AIConfig } from './companionAI'
import CompanionAISettings from './CompanionAISettings'
import { Check, Move, Plus, Send, Sparkles, Trash2, Volume2, VolumeX, X } from 'lucide-react'

type Buddy = { id:string; name:string; role:string; emoji:string; skin:string; mood:string; line:string }
const seed:Buddy[]=[
 {id:'owl',name:'Pip',role:'Study Buddy',emoji:'🦉',skin:'lavender',mood:'curious',line:'Which unit shall we make a little less mysterious?'},
 {id:'cat',name:'Miso',role:'Code Coach',emoji:'🐈‍⬛',skin:'matcha',mood:'focused',line:'A tiny coding win still counts as a win.'},
 {id:'fox',name:'Juniper',role:'Abroad Guide',emoji:'🦊',skin:'peach',mood:'hopeful',line:'Let’s find a place that feels like a possibility.'},
 {id:'cloud',name:'Nimbus',role:'Break Pal',emoji:'☁️',skin:'sky',mood:'sleepy',line:'Shoulders down. A sip of water, then we continue.'},
]
const greetings=['You’ve got this, one small step.','Want to pick one thing to focus on?','A little progress is still progress.','I’m right here if you need a reset.']
const actions=['What can you help me with?','Show my tasks','Where am I?']
function read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'') as T}catch{return fallback}}
export default function Companions({navigate,pageActive,currentPage}:{navigate:(page:Destination)=>void;pageActive:boolean;currentPage:string}){
 const [chatOpen,setChatOpen]=useState(false)
 const logRef=useRef<HTMLDivElement>(null)
 useEffect(()=>{
   const initial:Record<string,unknown>={'lifeos.skills.tree':seedTree(),'lifeos.skills.projects':defaultProjects,'lifeos.academics.subjects':seededSubjects,'lifeos.abroad.unis':seededUniversities,'lifeos.calendar.events':calendarSeeds}
   for(const [key,value] of Object.entries(initial))if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(value))
 },[])
 const [pending,setPending]=useState<Intent|null>(null)
 const [confirmation,setConfirmation]=useState<Intent|null>(null)
 const [choices,setChoices]=useState<{label:string;value:string}[]>([])
 const [contextId,setContextId]=useState<string|undefined>()
 const [ai,setAI]=useState<AIConfig>(()=>read('lifeos.companions.ai',defaultAI))
 const [aiOpen,setAIOpen]=useState(false)
 const [busy,setBusy]=useState(false)
 useEffect(()=>localStorage.setItem('lifeos.companions.ai',JSON.stringify(ai)),[ai])
 useEffect(()=>{
   const key='lifeos.companions.context.'+currentPage
   setContextId(localStorage.getItem(key)||undefined)
   const capture=(event:Event)=>{const target=event.target as Element;const item=target.closest?.('[data-companion-id]');const id=item?.getAttribute('data-companion-id');if(id){setContextId(id);localStorage.setItem(key,id)}}
   document.addEventListener('click',capture);document.addEventListener('focusin',capture)
   return()=>{document.removeEventListener('click',capture);document.removeEventListener('focusin',capture)}
 },[currentPage])
 const [lastResult,setLastResult]=useState<{text:string;destination:Destination}|null>(()=>read('lifeos.companions.lastResult',null))
 const [destination,setDestination]=useState<Destination|null>(null)
 const [buddies,setBuddies]=useState<Buddy[]>(()=>read('lifeos.companions.buddies',seed));const [selected,setSelected]=useState<string>(()=>read('lifeos.companions.selected','owl'));const [message,setMessage]=useState('');const [chat,setChat]=useState<string[]>(()=>read('lifeos.companions.chat',['Guide: Hi there! Ask me to add an assignment, add a subject unit, or show you where something lives.']));const [petOn,setPetOn]=useState<boolean>(()=>read('lifeos.companions.visible',true));const [sound,setSound]=useState(false);const [position,setPosition]=useState({x:0,y:0});const [drag,setDrag]=useState<{x:number;y:number;px:number;py:number}|null>(null);const [createOpen,setCreateOpen]=useState(false);const [newPet,setNewPet]=useState({name:'',role:'Study Buddy',template:'owl',look:'lavender'})
 useEffect(()=>localStorage.setItem('lifeos.companions.buddies',JSON.stringify(buddies)),[buddies]);const active=buddies.find(item=>item.id===selected)||buddies[0]
 useEffect(()=>localStorage.setItem('lifeos.companions.chat',JSON.stringify(chat.slice(-100))),[chat])
 useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight},[chat,chatOpen])
 useEffect(()=>localStorage.setItem('lifeos.companions.selected',JSON.stringify(selected)),[selected])
 useEffect(()=>localStorage.setItem('lifeos.companions.visible',JSON.stringify(petOn)),[petOn])
 useEffect(()=>localStorage.setItem('lifeos.companions.lastResult',JSON.stringify(lastResult)),[lastResult])
 const talk=(text:string)=>{if(!text.trim()||!active)return;setChat(items=>[...items,`${active.name}: ${text}`]);setMessage('');setBuddies(items=>items.map(item=>item.id===active.id?{...item,mood:'happy',line:text}:item))}

 const receive=(reply:Reply)=>{
   setPending(reply.pending||null);setChoices(reply.choices||[]);setConfirmation(reply.confirm||null)
   setDestination(reply.destination||null)
   if(reply.changed&&reply.destination)setLastResult({text:reply.text,destination:reply.destination})
   if(reply.focusId){setContextId(reply.focusId);localStorage.setItem('lifeos.companions.context.'+(reply.destination||currentPage),reply.focusId);window.dispatchEvent(new Event('lifeos-reveal'))}
   talk(reply.text)
 }
 const runIntent=(plan:Intent,confirmed=false)=>{try{receive(perform(plan,contextId,confirmed))}catch{talk('I couldn’t save that change. No success has been confirmed. Please try again.');setConfirmation(null)}}
 const send=async(input=message)=>{
   if(!input.trim()||!active||busy)return
   const value=input.trim();setChat(items=>[...items,`You: ${value}`]);setMessage('')
   if(/^(cancel|never mind|nevermind|stop)[.!]?$/i.test(value)){setPending(null);setConfirmation(null);setChoices([]);talk('Cancelled.');return}
   if(confirmation&&/^(yes|confirm|apply|do it)[.!]?$/i.test(value)){runIntent(confirmation,true);return}
   const intent=parseIntent(value)
   if(intent){setConfirmation(null);runIntent(intent);return}
   if(pending&&!/^(where|show|open|help|what|how|go|take)\b/i.test(value)){runIntent(continueIntent(pending,value));return}
   if(/where|find it|show me|take me/i.test(value)&&/\bit\b|where.*find/i.test(value)&&lastResult){setDestination(lastResult.destination);talk(lastResult.text+' Use the Open button below.');return}
   const local=workspaceAnswer(value,active.role,currentPage,contextId)
   if(local){receive(local);return}
   if(/^(open|go to|take me to)\b/i.test(value)){const result=guide(value,chat);if(result){receive(result);return}}
   if(ai.enabled){
     setBusy(true);setConfirmation(null)
     try{const reply=await askAI(ai,value,chat,active.role,currentPage,contextId);if(reply.action){setConfirmation(reply.action);setChoices([]);talk('I can propose this change: '+describeIntent(reply.action)+'. Review it below and Apply to save it.')}else talk(reply.text)}
     catch(error){talk((error instanceof Error?error.message:'The AI connection failed.')+' No changes were made. You can still use local commands or check AI settings.')}
     finally{setBusy(false)}
     return
   }
   talk('For flexible conversation and study explanations, connect an installed model using AI settings. Right now I can find and organise saved items across LifeOS. For example: “in Agent systems add subtopic Agentic AI”, “create project Portfolio”, or “add university Lund”. If you mean “this”, select the parent item first.')
 }
 const chooseAction=(action:string)=>{void send(action)}
 const context=indexWorkspace().find(item=>item.id===contextId)
 const createPet=()=>{const templates=[{id:'owl',emoji:'🦉'},{id:'cat',emoji:'🐈‍⬛'},{id:'fox',emoji:'🦊'},{id:'cloud',emoji:'☁️'},{id:'frog',emoji:'🐸'}];const template=templates.find(item=>item.id===newPet.template)!;const pet={id:crypto.randomUUID(),name:newPet.name.trim()||'Little friend',role:newPet.role,emoji:template.emoji,skin:newPet.look,mood:'curious',line:'Hello! I’m so happy we get to work together. ✨'};setBuddies(items=>[...items,pet]);setSelected(pet.id);setPetOn(true);setCreateOpen(false);setChat(items=>[...items,`${pet.name}: Hello! I’m so happy we get to work together. ✨`])}
 const deletePet=(id:string)=>{const remaining=buddies.filter(item=>item.id!==id);setBuddies(remaining);if(selected===id)setSelected(remaining[0]?.id||'');if(!remaining.length)setPetOn(false)}
 const startDrag=(event:ReactPointerEvent<HTMLDivElement>)=>{if((event.target as HTMLElement).closest('button,input'))return;setDrag({x:event.clientX,y:event.clientY,px:position.x,py:position.y});event.currentTarget.setPointerCapture(event.pointerId)}
 useEffect(()=>{const clamp=()=>setPosition(p=>({x:Math.min(0,Math.max(-window.innerWidth+110,p.x)),y:Math.min(0,Math.max(-window.innerHeight+120,p.y))}));window.addEventListener('resize',clamp);return()=>window.removeEventListener('resize',clamp)},[])
 useEffect(()=>{if(!drag)return;const move=(event:PointerEvent)=>setPosition({x:Math.min(0,Math.max(-window.innerWidth+110,drag.px+event.clientX-drag.x)),y:Math.min(0,Math.max(-window.innerHeight+120,drag.py+event.clientY-drag.y))});const up=()=>setDrag(null);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up)}},[drag])
 if(!active)return <div className="companions-page" hidden={!pageActive}><header className="companion-welcome"><span className="eyebrow">LIFEOS LITTLE FRIENDS</span><h1>A softer kind of support.</h1><p>Every friend has wandered off for now. You can always make a new one.</p></header><button className="primary" onClick={()=>setCreateOpen(true)}><Plus size={17}/> Create a companion</button>{createOpen&&<CreatePet value={newPet} setValue={setNewPet} save={createPet} close={()=>setCreateOpen(false)}/>}</div>
 return <div className={`companions-page ${pageActive?'':'companions-away'} ${chatOpen?'companion-chat-open':''}`}><header className="companion-welcome"><span className="eyebrow">LIFEOS LITTLE FRIENDS</span><h1>A softer kind of support.</h1><p>Choose a companion, give them a little personality, and let them keep you company while you work.</p><div className="companion-count"><Sparkles size={15}/> {buddies.length} friends in your corner</div></header>
 <div className="companion-layout"><section className="buddy-gallery">{buddies.map(buddy=><div key={buddy.id} className={`buddy-card ${buddy.skin} ${selected===buddy.id?'selected':''}`}><button className="buddy-select" onClick={()=>setSelected(buddy.id)}><div className={`buddy-art ${buddy.mood}`}><span>{buddy.emoji}</span><i>✦</i></div><span className="buddy-card-copy"><b>{buddy.name}</b><small>{buddy.role}</small></span></button><button className="buddy-delete" title={`Delete ${buddy.name}`} aria-label={`Delete ${buddy.name}`} onClick={()=>deletePet(buddy.id)}><Trash2 size={14}/></button><span className="mood-tag">{buddy.mood}</span></div>)}<button className="add-buddy" onClick={()=>setCreateOpen(true)}><Plus size={19}/><b>Create a companion</b><small>Choose a template and make it yours</small></button></section>
 <section className="buddy-room"><div className="room-sky"><div className="room-sun"/><div className="room-cloud cloud-a">☁</div><div className="room-cloud cloud-b">☁</div><div className="room-hill hill-back"/><div className="room-hill hill-front"/><div className={`room-buddy ${active.skin} ${active.mood}`}><span>{active.emoji}</span><i>♡</i></div><div className="speech-bubble">{active.line}</div><span className="room-caption">{active.name} · {active.role}</span></div><div className="buddy-controls"><label>Name<input value={active.name} onChange={event=>setBuddies(items=>items.map(item=>item.id===active.id?{...item,name:event.target.value}:item))}/></label><label>Role<select value={active.role} onChange={event=>setBuddies(items=>items.map(item=>item.id===active.id?{...item,role:event.target.value}:item))}><option>Study Buddy</option><option>Planner Pal</option><option>Code Coach</option><option>Research Raccoon</option><option>Abroad Guide</option><option>Break Pal</option><option>Your companion</option></select></label><label>Look<select value={active.skin} onChange={event=>setBuddies(items=>items.map(item=>item.id===active.id?{...item,skin:event.target.value}:item))}><option value="lavender">Lavender dusk</option><option value="matcha">Matcha</option><option value="peach">Peach glow</option><option value="sky">Nordic sky</option><option value="mint">Mint</option></select></label><button className="delete-buddy" onClick={()=>deletePet(active.id)}><Trash2 size={14}/> Delete</button></div></section>
 <aside className="buddy-chat"><div className="chat-title"><button className="icon-btn global-chat-close" aria-label="Close companion chat" onClick={()=>setChatOpen(false)}><X size={16}/></button><div><span className="eyebrow">A LITTLE CHAT</span><h2>With {active.name}</h2><small>{currentPage} · {pending?'Waiting for your answer':ai.enabled?'AI connected · '+active.role:'Local guide · '+active.role}</small></div><button className="icon-btn" onClick={()=>setSound(!sound)} title="Toggle sound">{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button></div><div className="companion-context"><span>{context?'Selected: '+context.path:'No parent selected. Click a subject, topic or track to use “this”.'}</span><button type="button" onClick={()=>setAIOpen(true)}>AI settings</button></div><div className="chat-log" ref={logRef} role="log" aria-live="polite">{chat.slice(-6).map((line,index)=><div className={line.startsWith('You:')?'chat-you':'chat-them'} key={`${line}-${index}`}>{line}</div>)}</div><div className="quick-actions">{actions.map(action=><button key={action} onClick={()=>chooseAction(action)}>{action}</button>)}</div>{choices.length>0&&<div className="companion-choices">{choices.map(choice=><button key={choice.value} onClick={()=>{if(pending)runIntent(continueIntent(pending,choice.value))}}>{choice.label}</button>)}</div>}{confirmation&&<div className="companion-confirm"><p>Proposed: {describeIntent(confirmation)}</p><button onClick={()=>runIntent(confirmation,true)}>Apply change</button><button onClick={()=>{setConfirmation(null);talk('Proposal dismissed. Nothing changed.')}}>Dismiss</button></div>}{busy&&<p role="status">Thinking with your workspace context…</p>}<form className="chat-compose" onSubmit={event=>{event.preventDefault();send()}}><input value={message} onChange={event=>setMessage(event.target.value)} disabled={busy} placeholder="Ask, explain, find or change something…"/><button disabled={busy} aria-label="Send message"><Send size={15}/></button></form>{destination&&<button className="primary companion-go" onClick={()=>navigate(destination)}>Open {destination}</button>}</aside></div>

 <footer className="companion-footer"><div><Move size={16}/><span><b>Bring a friend along</b><small>Turn on the floating pet, then drag them anywhere in the app.</small></span></div><button className={`pet-toggle ${petOn?'on':''}`} onClick={()=>setPetOn(!petOn)}>{petOn?'Pet is visiting':'Invite pet'}</button></footer>
 {petOn&&<div className={`floating-pet ${active.skin}`} style={{transform:`translate(${position.x}px, ${position.y}px)`}} onPointerDown={startDrag}><div className="floating-halo"/><button className="pet-chat-trigger" title={`Chat with ${active.name}`} aria-label={`Chat with ${active.name}`} onClick={()=>setChatOpen(!chatOpen)}>{active.emoji}</button><span className="pet-drag-handle" title="Drag your pet"><Move size={14}/></span><button className="floating-close" title="Hide pet" onClick={()=>{setPetOn(false);setChatOpen(false)}}><X size={11}/></button><div className="floating-tip">Click to chat · drag the handle ✦</div></div>}
 {aiOpen&&<CompanionAISettings value={ai} save={setAI} close={()=>setAIOpen(false)}/>}
 {createOpen&&<CreatePet value={newPet} setValue={setNewPet} save={createPet} close={()=>setCreateOpen(false)}/>}
 </div>
}

function CreatePet({value,setValue,save,close}:{value:{name:string;role:string;template:string;look:string};setValue:(value:{name:string;role:string;template:string;look:string})=>void;save:()=>void;close:()=>void}){return <div className="overlay" onMouseDown={close}><form className="create-pet-modal" onSubmit={event=>{event.preventDefault();save()}} onMouseDown={event=>event.stopPropagation()}><button type="button" className="modal-close" onClick={close}><X size={17}/></button><span className="eyebrow">A NEW LITTLE SOUL</span><h2>Create your companion</h2><div className="template-choices">{[{id:'owl',emoji:'🦉',name:'Owl'},{id:'cat',emoji:'🐈‍⬛',name:'Cat'},{id:'fox',emoji:'🦊',name:'Fox'},{id:'cloud',emoji:'☁️',name:'Cloud'},{id:'frog',emoji:'🐸',name:'Frog'}].map(item=><button type="button" key={item.id} className={value.template===item.id?'selected':''} onClick={()=>setValue({...value,template:item.id})}><span>{item.emoji}</span><small>{item.name}</small></button>)}</div><label>Name<input value={value.name} onChange={event=>setValue({...value,name:event.target.value})} placeholder="What should we call them?"/></label><label>Personality / role<select value={value.role} onChange={event=>setValue({...value,role:event.target.value})}><option>Study Buddy</option><option>Planner Pal</option><option>Code Coach</option><option>Research Raccoon</option><option>Abroad Guide</option><option>Break Pal</option><option>Your companion</option></select></label><label>Colour mood<select value={value.look} onChange={event=>setValue({...value,look:event.target.value})}><option value="lavender">Lavender dusk</option><option value="matcha">Matcha green</option><option value="peach">Peach glow</option><option value="sky">Nordic sky</option><option value="mint">Mint meadow</option></select></label><button className="primary" type="submit"><Sparkles size={15}/> Bring them to life</button></form></div>}
