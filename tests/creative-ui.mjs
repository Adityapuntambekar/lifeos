import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {createServer} from 'vite'
const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://localhost',pretendToBeVisual:true})
for(const key of ['window','document','navigator','Node','HTMLElement','Element','DOMParser','MutationObserver','getComputedStyle','localStorage','location','history'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]})
globalThis.IS_REACT_ACT_ENVIRONMENT=true
const {act,createElement}=await import('react'),{createRoot}=await import('react-dom/client')
const server=await createServer({server:{middlewareMode:true},appType:'custom'}),root=createRoot(document.getElementById('root'))
const click=async(element)=>{assert.ok(element,'Expected control exists');await act(async()=>element.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true})))}
const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text))
try{
 const {default:Room}=await server.ssrLoadModule('/src/PersonalRoom.tsx');let journal=false
 await act(async()=>root.render(createElement(Room,{name:'Tester',color:'#8569c4',back:()=>{},write:()=>journal=true})))
 await click(document.querySelector('[aria-label="chair column 4 row 4"]'));assert.ok(document.querySelector('.room-resident.sitting'))
 await click(button('Decorate room'));await click(document.querySelector('[aria-label="Floor column 1 row 1"]'));assert.equal(JSON.parse(localStorage.getItem('lifeos.space.personal')).items.some(i=>i.x===0&&i.y===0&&i.kind==='plant'),true)
 await click(button('Erase'));await click(document.querySelector('[aria-label="plant column 1 row 1"]'));assert.equal(JSON.parse(localStorage.getItem('lifeos.space.personal')).items.some(i=>i.x===0&&i.y===0),false)
 await click(button('Open journal'));assert.equal(journal,true)
 const {default:Space}=await server.ssrLoadModule('/src/Space.tsx');await act(async()=>root.render(createElement(Space,{active:true,onReturn:()=>{},onJournal:()=>journal=true})));await click(button('Explore my rooms'));assert.ok(document.querySelector('.space-studio'),'Room collection opens without a server connection');await click(button('Campus'));assert.ok(button('Create a space'));
 const {default:Graph}=await server.ssrLoadModule('/src/NoteGraph.tsx');let opened='';const note=(id,title,body)=>({id,title,body,text:body,mode:'knowledge',tags:[],folder:'',pinned:false,created:1,updated:1,deleted:null})
 await act(async()=>root.render(createElement(Graph,{notes:[note('a','Alpha','[[Beta]]'),note('b','Beta','')],active:'a',open:n=>opened=n.id})))
 assert.equal(document.querySelectorAll('.atlas-node').length,2);assert.equal(document.querySelectorAll('.atlas-canvas line').length,1)
 await click(document.querySelector('[aria-label="Zoom in"]'));assert.match(document.querySelector('.atlas-canvas>g').getAttribute('transform'),/scale\(1.2\)/)
 await click(button('Reset view'));assert.match(document.querySelector('.atlas-canvas>g').getAttribute('transform'),/scale\(1\)/)
 await click([...document.querySelectorAll('.atlas-note-list button')].find(b=>b.textContent==='Beta'));assert.equal(opened,'b')
 console.log('DOM interaction checks passed: room sitting, decoration placement/removal persistence, journal navigation, graph topology, zoom/reset and opening notes. This is not visual browser QA.')
}finally{await act(async()=>root.unmount());await server.close();dom.window.close()}
