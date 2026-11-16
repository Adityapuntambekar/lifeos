import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {createServer} from 'vite'
const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://localhost',pretendToBeVisual:true})
for(const key of ['window','document','navigator','Node','HTMLElement','Element','HTMLInputElement','DOMParser','MutationObserver','getComputedStyle','localStorage','location','history','Event','CustomEvent'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]})
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window)
globalThis.matchMedia=window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}})
dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true}
globalThis.confirm=()=>true;globalThis.IS_REACT_ACT_ENVIRONMENT=true
const {act,createElement}=await import('react'),{createRoot}=await import('react-dom/client'),server=await createServer({server:{middlewareMode:true},appType:'custom'}),root=createRoot(document.getElementById('root'))
const button=text=>[...document.querySelectorAll('button')].find(b=>!b.closest('[hidden]')&&b.textContent.includes(text))
const click=async(el)=>{assert.ok(el,'Expected control');await act(async()=>el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true})))}
const fill=async(el,value)=>{assert.ok(el);await act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new dom.window.Event('input',{bubbles:true}))})}
const submit=async(form)=>act(async()=>form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})))
try{
 const {default:App}=await server.ssrLoadModule('/src/App.tsx');await act(async()=>root.render(createElement(App)))
 await click(document.querySelector('[aria-label="Open workspace settings"]'));assert.ok(document.querySelector('dialog[open]'));await fill(document.querySelector('.profile-fields input'),'Beta Tester');await click(button('Save profile'));assert.equal(JSON.parse(localStorage.getItem('lifeos.profile')).name,'Beta Tester');await click(button('Done'));assert.match(document.querySelector('.profile').textContent,/Beta Tester/)
 for(const page of ['Academics','Skills','Abroad','Calendar','Journal','Space','Companions','Home']){await click(document.querySelector(`nav [aria-label="${page}"]`));assert.equal(document.querySelector('.crumb b').textContent,page);assert.ok(document.querySelector('main').textContent.length>100)}
 localStorage.setItem('lifeos.academics.grades',JSON.stringify([{id:'zero',subject:'First',credits:3,point:0},{id:'ten',subject:'Second',credits:3,point:10}]))
 await click(document.querySelector('nav [aria-label="Academics"]'));await click(button('Add subject'));assert.equal(JSON.parse(localStorage.getItem('lifeos.academics.subjects')).length,1);await click(button('Grades & credits'));assert.equal(document.querySelector('.sgpa-total b').textContent,'5.00');await fill(document.querySelector('[aria-label="ECTS for New subject"]'),'6');assert.equal(JSON.parse(localStorage.getItem('lifeos.academics.subjects'))[0].ects,6)
 await click(document.querySelector('nav [aria-label="Skills"]'));await click(button('Category'));const category=[...document.querySelectorAll('.tree-line')].find(line=>line.querySelector('input')?.value==='New category');assert.ok(category);await click(category.querySelector('[title="Delete item"]'));assert.ok(!JSON.parse(localStorage.getItem('lifeos.skills.tree')).Programming.some(n=>n.title==='New category'))
 await click(document.querySelector('nav [aria-label="Abroad"]'));await click(button('Add your first university'));assert.equal(JSON.parse(localStorage.getItem('lifeos.abroad.unis')).length,1);await click(button('Delete selected university'));assert.equal(JSON.parse(localStorage.getItem('lifeos.abroad.unis')).length,0)
 await click(document.querySelector('nav [aria-label="Calendar"]'));await click(button('Add event'));const modal=document.querySelector('.event-modal');await fill(modal.querySelector('input'),'Group study');await submit(modal);await click(button('Agenda'));await click(document.querySelector('[aria-label="Edit Group study"]'));await fill(document.querySelector('.event-modal input'),'Updated study');await submit(document.querySelector('.event-modal'));assert.equal(JSON.parse(localStorage.getItem('lifeos.calendar.events')).length,1);assert.equal(JSON.parse(localStorage.getItem('lifeos.calendar.events'))[0].title,'Updated study');await click(document.querySelector('[aria-label="Delete Updated study"]'));assert.equal(JSON.parse(localStorage.getItem('lifeos.calendar.events')).length,0)
 const {readSaved,writeSaved}=await server.ssrLoadModule('/src/savedStorage.tsx');localStorage.setItem('lifeos.tasks','{"bad":true}');assert.deepEqual(readSaved('lifeos.tasks',[]),[]);writeSaved('lifeos.tasks','[]');assert.equal(localStorage.getItem('lifeos.tasks'),'{"bad":true}')
 console.log('App audit checks passed: all eight sections render, profile control saves, calendar edits/deletes and malformed task data is preserved.')
}finally{await act(async()=>root.unmount());await server.close();dom.window.close()}

