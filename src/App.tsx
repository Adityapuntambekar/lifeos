import {newId} from './ids.ts'
import { useEffect, useMemo, useState } from 'react'
import {
  Bell, BookOpen, Bot, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, Code2, Command, FileText, GraduationCap, LayoutDashboard,
  Menu, MoreHorizontal, Plus, Search, Settings, Sparkles, Target, X
} from 'lucide-react'
import { initialTasks, scores, studyWeek, type Task } from './data'
import Academics from './Academics'
import Skills from './Skills'
import Abroad from './Abroad'
import Calendar from './Calendar'
import Space from './Space'
import Companions from './Companions'
import AppSettings from './AppSettings'
import Journal from './Journal'
import HomeDashboard from './HomeDashboard'
import {useProfile} from './profile'

type Page = 'Journal' | 'Space' | 'Home' | 'Academics' | 'Skills' | 'Abroad' | 'Calendar' | 'Companions'
const pages: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: 'Home', icon: LayoutDashboard }, {label:'Journal',icon:BookOpen}, { label: 'Academics', icon: GraduationCap },
  { label: 'Skills', icon: Code2 }, { label: 'Abroad', icon: Target },
  { label: 'Space', icon: Bot }, { label: 'Calendar', icon: CalendarDays }, { label: 'Companions', icon: Bot },
]

function useSavedTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try { return JSON.parse(localStorage.getItem('lifeos.tasks') || 'null') || initialTasks } catch { return initialTasks }
  })
  useEffect(() => localStorage.setItem('lifeos.tasks', JSON.stringify(tasks)), [tasks])
  useEffect(() => {
    const refresh = () => { try { setTasks(JSON.parse(localStorage.getItem('lifeos.tasks') || '[]')) } catch { /* keep current in-memory tasks */ } }
    window.addEventListener('lifeos-tasks-updated', refresh)
    return () => window.removeEventListener('lifeos-tasks-updated', refresh)
  }, [])
  return [tasks, setTasks] as const
}

const dateText = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
const daysUntil = (value: string) => Math.ceil((new Date(`${value}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
const friendlyCountdown = (date: string) => {
  const d = daysUntil(date)
  return d < 0 ? 'Passed' : d === 0 ? 'Today' : `${d} day${d === 1 ? '' : 's'}`
}

export default function App() {
  const profile=useProfile()
  const [page, setPage] = useState<Page>(()=>new URLSearchParams(location.search).has('room')?'Space':'Home')
  const [tasks, setTasks] = useSavedTasks()
  const [settingsOpen,setSettingsOpen]=useState(false)
  const [sidebar, setSidebar] = useState(true)
  const [palette, setPalette] = useState(false)
  const [theme, setTheme] = useState(()=>{try{const saved=JSON.parse(localStorage.getItem('lifeos.theme')||'"nordic"');return ['nordic','lavender','matcha','sakura','midnight'].includes(saved)?saved:'nordic'}catch{return 'nordic'}})
  useEffect(()=>localStorage.setItem('lifeos.theme',JSON.stringify(theme)),[theme])
  const [addOpen, setAddOpen] = useState(false)
  const [newTask, setNewTask] = useState('')
  const complete = tasks.filter(t => t.done).length
  const nextExam = useMemo(() => friendlyCountdown('2026-11-23'), [])

  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPalette(true) } }
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener)
  }, [])
  const toggleTask = (id: string) => setTasks(items => items.map(task => task.id === id ? { ...task, done: !task.done } : task))
  const submitTask = () => { if (!newTask.trim()) return; setTasks(items => [...items, { id: newId(), title: newTask.trim(), category: 'Personal', done: false }]); setNewTask(''); setAddOpen(false) }

  return <div className={`app theme-${theme}`}>
    <aside className={`sidebar ${sidebar ? '' : 'collapsed'}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18}/></div>{sidebar && <span>LifeOS</span>}<button className="icon-btn collapse" onClick={() => setSidebar(!sidebar)} aria-label="Collapse sidebar"><ChevronLeft size={17}/></button></div>
      <nav>{pages.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => setPage(label)}><Icon size={18}/>{sidebar && <span>{label}</span>}{label === 'Companions' && sidebar && <span className="dot"/>}</button>)}</nav>
      {sidebar && <><p className="nav-heading">WORKSPACES</p><button className="tree-item" onClick={()=>setPage('Academics')}><BookOpen size={16}/> Learning tracker <MoreHorizontal size={15}/></button><button className="tree-item" onClick={()=>setPage('Journal')}><FileText size={16}/> My notes</button><button className="tree-item" onClick={()=>setPage('Abroad')}><Target size={16}/> World explorer</button></>}
      <div className="sidebar-bottom"><button className="nav-item" onClick={()=>setSettingsOpen(true)}><Settings size={18}/>{sidebar && <span>Settings</span>}</button><div className="profile"><div className="avatar">{profile.name.split(/\s+/).map(n=>n[0]).join('').slice(0,2).toUpperCase()||'✦'}</div>{sidebar && <div><b>{profile.name||'Your space'}</b><small>{profile.workspace}</small></div>}<ChevronDown size={15}/></div></div>
    </aside>

    <main>
      <header><div className="mobile-brand"><button className="icon-btn" onClick={() => setSidebar(!sidebar)}><Menu size={20}/></button><span>LifeOS</span></div><div className="crumb"><span>{profile.workspace}</span><ChevronRight size={15}/><b>{page}</b></div><div className="header-actions"><button className="today-chip"><Clock3 size={15}/>{dateText.format(new Date())}</button><button className="search-btn" onClick={() => setPalette(true)}><Search size={17}/><span>Go to a page</span><kbd>⌘ K</kbd></button><button className="icon-btn notification"><Bell size={18}/><i/></button></div></header>
      {page === 'Home' ? <HomeDashboard tasks={tasks} toggle={toggleTask} remove={id=>setTasks(items=>items.filter(t=>t.id!==id))} add={()=>setAddOpen(true)} go={setPage}/> : page === 'Academics' ? <Academics /> : page === 'Skills' ? <Skills /> : page === 'Abroad' ? <Abroad /> : page === 'Journal' ? null : page === 'Space' ? null : page === 'Calendar' ? <Calendar /> : page === 'Companions' ? null : <ComingSoon page={page} />}
      <div hidden={page!=='Journal'}><Journal/></div>
      <Space active={page === 'Space'} onReturn={()=>setPage('Space')}/>
      <Companions navigate={setPage} pageActive={page === 'Companions'} currentPage={page}/>
    </main>
    {settingsOpen&&<AppSettings close={()=>setSettingsOpen(false)}/>}
    {palette && <CommandPalette close={() => setPalette(false)} go={p => { setPage(p); setPalette(false) }} />}
    {addOpen && <TaskModal value={newTask} setValue={setNewTask} save={submitTask} close={() => setAddOpen(false)} />}
    <div className="theme-picker"><span>Theme</span>{['nordic', 'lavender', 'matcha', 'sakura', 'midnight'].map(t => <button key={t} title={t} onClick={() => setTheme(t)} className={theme === t ? 'selected' : ''}/>)}</div>
  </div>
}

function ComingSoon({ page }: { page: Page }) { return <div className="coming"><div className="coming-icon">{page === 'Academics' ? '📚' : page === 'Skills' ? '🧩' : page === 'Abroad' ? '✈️' : page === 'Calendar' ? '🗓️' : '🦉'}</div><span className="eyebrow">LIFEOS · PHASE 1</span><h1>{page}</h1><p>This workspace has its navigation, theme system, and local-first data foundation ready. Its detailed tools are next in the build plan.</p><button className="primary">View build roadmap <ChevronRight size={16}/></button></div> }
function CommandPalette({ close, go }: { close: () => void; go: (page: Page) => void }) { const [query, setQuery] = useState(''); const results = pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase())); return <div className="overlay" onMouseDown={close}><div className="palette" onMouseDown={e => e.stopPropagation()}><div className="palette-input"><Search size={19}/><input autoFocus placeholder="Find a workspace…" value={query} onChange={e => setQuery(e.target.value)}/><kbd>ESC</kbd></div><p>JUMP TO</p>{results.map(({label, icon: Icon}) => <button onClick={() => go(label)} key={label}><Icon size={17}/>{label}<span>Go to page</span></button>)}<div className="palette-footer"><span><kbd>Tab</kbd> navigate</span><span><kbd>↵</kbd> open</span></div></div></div> }
function TaskModal({ value, setValue, save, close }: { value: string; setValue: (v: string) => void; save: () => void; close: () => void }) { return <div className="overlay" onMouseDown={close}><form className="task-modal" onSubmit={e => {e.preventDefault(); save()}} onMouseDown={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={close}><X size={18}/></button><span className="eyebrow">QUICK CAPTURE</span><h2>Add something to your day</h2><input autoFocus value={value} onChange={e => setValue(e.target.value)} placeholder="What would you like to remember?"/><button className="primary" type="submit">Add task <Plus size={17}/></button></form></div> }
