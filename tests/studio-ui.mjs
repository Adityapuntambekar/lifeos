import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {createServer} from 'vite'
import {validStudio} from '../shared/studioWorld.ts'
const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://localhost',pretendToBeVisual:true})
for(const key of ['window','document','navigator','Node','HTMLElement','Element','DOMParser','MutationObserver','getComputedStyle','localStorage'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]})
globalThis.IS_REACT_ACT_ENVIRONMENT=true
const {act,createElement}=await import('react'),{createRoot}=await import('react-dom/client'),server=await createServer({server:{middlewareMode:true},appType:'custom'}),root=createRoot(document.getElementById('root'))
const button=(text,scope=document)=>[...scope.querySelectorAll('button')].find(b=>b.textContent.includes(text))
const click=async(el)=>{assert.ok(el);await act(async()=>el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true})))}
const point=async(type,x,y)=>{const map=document.querySelector('.studio-map');map.getBoundingClientRect=()=>({left:0,top:0,width:800,height:560});map.setPointerCapture=()=>{};await act(async()=>map.dispatchEvent(new dom.window.MouseEvent(type,{bubbles:true,clientX:x*40+20,clientY:y*40+20})))}
const saved=()=>JSON.parse(localStorage.getItem('lifeos.space.studio'))
try{
 const {default:Studio}=await server.ssrLoadModule('/src/SpaceStudio.tsx');let journal=false,opened=null
 localStorage.setItem('lifeos.tasks',JSON.stringify([{id:'task-one',title:'Read chapter',done:false}]))
 localStorage.setItem('lifeos.journal',JSON.stringify({notes:[{id:'note-one',mode:'knowledge',title:'Reading notes',body:'',text:'',folder:'',tags:[],pinned:false,created:1,updated:1,deleted:null}],folders:[]}))
 localStorage.setItem('lifeos.space.desk',JSON.stringify({version:1,roomId:'library',seatId:'',taskId:'task-one',noteId:'note-one',reflection:'Continue chapter two',updated:1}))
 await act(async()=>root.render(createElement(Studio,{name:'Tester',color:'#8569c4',back:()=>{},write:()=>journal=true,onOpen:(page,id)=>opened={page,id}})))
 assert.equal(document.querySelectorAll('.studio-rooms>button[aria-pressed]').length,4)
 await click(button('Edit map'));await click(button('Add a room'));await click(button('Blank canvas',document.querySelector('.studio-template-picker')))
 await click(button('Leafy plant'));await point('pointerup',2,3);await click(button('Undo'));await click(button('Save & explore'))
 assert.ok(validStudio(saved()));assert.equal(saved().rooms.length,5);assert.equal(saved().rooms.at(-1).objects.length,0)
 await click(button('Edit map'));await click(button('Leafy plant'));await point('pointerup',2,3);await click(button('Select',document.querySelector('.studio-editor-tabs')));await point('pointerdown',2,3);await point('pointerup',4,3);await click(button('Save & explore'))
 assert.equal(saved().rooms.at(-1).objects.length,1);assert.equal(saved().rooms.at(-1).objects[0].x,4)
 await click(button('Edit map'));await click(button('Delete room'));await click(button('Undo'));await click(button('Redo'));await click(button('Undo'));await click(button('Save & explore'));assert.equal(saved().rooms.length,5)
 await click(button('Map'));assert.equal(document.querySelectorAll('.studio-atlas button').length,5);await click(document.querySelectorAll('.studio-atlas button')[1]);assert.match(document.querySelector('.studio-header h2').textContent,/Team office/)
 await click(button('My desk'));await click(button('Open task'));assert.deepEqual(opened,{page:'Home',id:'task-one'});await click(button('Open note'));assert.deepEqual(opened,{page:'Journal',id:'note-one'});await click(button('Save this spot'));assert.equal(JSON.parse(localStorage.getItem('lifeos.space.desk')).roomId,saved().rooms[1].id)
 await click(document.querySelectorAll('.studio-rooms>button[aria-pressed]')[0]);await click(button('Resume at my desk'));assert.match(document.querySelector('.studio-header h2').textContent,/Team office/)
 await click(button('Immersive view'));assert.ok(document.querySelector('.is-immersive'));await act(async()=>window.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape'})));assert.equal(document.querySelector('.is-immersive'),null)
 await click(button('Open Journal'));assert.equal(journal,true)
 await act(async()=>root.render(createElement(Studio,{key:'reload',name:'Tester',color:'#8569c4',back:()=>{},write:()=>{}})));assert.equal(document.querySelectorAll('.studio-rooms>button[aria-pressed]').length,5)
 console.log('Studio DOM checks passed: room templates, valid saved maps, placement undo, dragging, room deletion undo/redo, atlas navigation, Journal navigation and reload persistence.')
}finally{await act(async()=>root.unmount());await server.close();dom.window.close()}
