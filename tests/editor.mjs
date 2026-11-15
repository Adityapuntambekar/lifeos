import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
const dom=new JSDOM('<!doctype html><div id="editor"></div>',{url:'http://localhost',pretendToBeVisual:true})
for(const key of ['window','document','navigator','Node','HTMLElement','Element','DOMParser','MutationObserver','getComputedStyle'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]})
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window)
const {Editor}=await import('@tiptap/core'),{default:StarterKit}=await import('@tiptap/starter-kit'),{default:TaskList}=await import('@tiptap/extension-task-list'),{default:TaskItem}=await import('@tiptap/extension-task-item'),{TableKit}=await import('@tiptap/extension-table')
const editor=new Editor({element:document.querySelector('#editor'),extensions:[StarterKit,TaskList,TaskItem.configure({nested:true}),TableKit],content:'<h2>Reflection</h2><p>Remember this</p>'})
try{
 assert.equal(editor.getText().includes('Remember this'),true)
 editor.commands.setTextSelection({from:14,to:22});editor.commands.toggleBold();assert.match(editor.getHTML(),/<strong>/)
 editor.commands.setContent('<p>One task</p>');editor.commands.setTextSelection(2);editor.commands.toggleTaskList();assert.match(editor.getHTML(),/data-type="taskList"/)
 editor.commands.setContent('<p></p>');editor.commands.insertTable({rows:3,cols:3,withHeaderRow:true});assert.equal((editor.getHTML().match(/<tr>/g)||[]).length,3);editor.commands.addRowAfter();assert.equal((editor.getHTML().match(/<tr>/g)||[]).length,4);editor.commands.deleteTable();assert.doesNotMatch(editor.getHTML(),/<table/)
 editor.commands.setContent('<p>Safe<script>alert(1)</script><iframe src="https://invalid.test"></iframe><a href="javascript:alert(1)">link</a></p>');assert.doesNotMatch(editor.getHTML(),/<script|<iframe|href="javascript:/)
 console.log('Editor checks passed: rich-text roundtrip, formatting, checklists, table editing and unsafe-content removal. No browser visual verification claimed.')
}finally{editor.destroy();dom.window.close()}
