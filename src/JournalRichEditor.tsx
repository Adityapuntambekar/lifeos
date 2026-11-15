import {useRef} from 'react'
import {useEditor,EditorContent} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {TableKit} from '@tiptap/extension-table'
import Placeholder from '@tiptap/extension-placeholder'
export default function JournalRichEditor({body,onChange}:{body:string;onChange:(html:string,text:string)=>void}){
 const change=useRef(onChange);change.current=onChange
 const editor=useEditor({extensions:[StarterKit.configure({link:{openOnClick:false}}),TaskList,TaskItem.configure({nested:true}),TableKit,Placeholder.configure({placeholder:'A thought, a memory, a beginning…'})],content:body,shouldRerenderOnTransaction:true,editorProps:{attributes:{'aria-label':'Journal writing area',class:'journal-rich'}},onUpdate:({editor})=>change.current(editor.getHTML(),editor.getText())})
 if(!editor)return null
 const action=(label:string,run:()=>unknown,active=false)=><button type="button" key={label} title={label} aria-pressed={active} onClick={()=>run()}>{label}</button>
 return <><div className="journal-format" role="toolbar" aria-label="Text formatting">
 {action('Bold',()=>editor.chain().focus().toggleBold().run(),editor.isActive('bold'))}{action('Italic',()=>editor.chain().focus().toggleItalic().run(),editor.isActive('italic'))}{action('Underline',()=>editor.chain().focus().toggleUnderline().run(),editor.isActive('underline'))}{action('Heading',()=>editor.chain().focus().toggleHeading({level:2}).run(),editor.isActive('heading'))}{action('List',()=>editor.chain().focus().toggleBulletList().run(),editor.isActive('bulletList'))}{action('Checklist',()=>editor.chain().focus().toggleTaskList().run(),editor.isActive('taskList'))}{action('Quote',()=>editor.chain().focus().toggleBlockquote().run(),editor.isActive('blockquote'))}{action('Table',()=>editor.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run())}{action('Link',()=>{const href=prompt('Paste an https:// link (leave empty to remove):',editor.getAttributes('link').href||'');if(href===null)return;if(!href){editor.chain().focus().unsetLink().run();return}try{const url=new URL(href);if(!['https:','http:'].includes(url.protocol))throw Error();editor.chain().focus().setLink({href:url.href}).run()}catch{alert('Please use a valid http:// or https:// address.')}})}{action('Undo',()=>editor.chain().focus().undo().run())}{action('Redo',()=>editor.chain().focus().redo().run())}
 {editor.isActive('table')&&<>{action('+ Row',()=>editor.chain().focus().addRowAfter().run())}{action('+ Column',()=>editor.chain().focus().addColumnAfter().run())}{action('− Row',()=>editor.chain().focus().deleteRow().run())}{action('− Column',()=>editor.chain().focus().deleteColumn().run())}{action('Remove table',()=>editor.chain().focus().deleteTable().run())}</>}
 </div><EditorContent editor={editor}/></>
}
