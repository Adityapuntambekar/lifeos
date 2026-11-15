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

type Page = 'Space' | 'Home' | 'Academics' | 'Skills' | 'Abroad' | 'Calendar' | 'Companions'
const pages: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: 'Home', icon: LayoutDashboard }, { label: 'Academics', icon: GraduationCap },
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
  const submitTask = () => { if (!newTask.trim()) return; setTasks(items => [...items, { id: crypto.randomUUID(), title: newTask.trim(), category: 'Personal', done: false }]); setNewTask(''); setAddOpen(false) }

  return <div className={`app theme-${theme}`}>
    <aside className={`sidebar ${sidebar ? '' : 'collapsed'}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18}/></div>{sidebar && <span>LifeOS</span>}<button className="icon-btn collapse" onClick={() => setSidebar(!sidebar)} aria-label="Collapse sidebar"><ChevronLeft size={17}/></button></div>
      <nav>{pages.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => setPage(label)}><Icon size={18}/>{sidebar && <span>{label}</span>}{label === 'Companions' && sidebar && <span className="dot"/>}</button>)}</nav>
      {sidebar && <><p className="nav-heading">WORKSPACES</p><button className="tree-item"><BookOpen size={16}/> College tracker <MoreHorizontal size={15}/></button><button className="tree-item"><FileText size={16}/> Paper library</button><button className="tree-item"><Target size={16}/> 2028 applications</button></>}
      <div className="sidebar-bottom"><button className="nav-item" onClick={()=>setSettingsOpen(true)}><Settings size={18}/>{sidebar && <span>Settings</span>}</button><div className="profile"><div className="avatar">AP</div>{sidebar && <div><b>Aditya</b><small>Nordic Frost</small></div>}<ChevronDown size={15}/></div></div>
    </aside>

    <main>
      <header><div className="mobile-brand"><button className="icon-btn" onClick={() => setSidebar(!sidebar)}><Menu size={20}/></button><span>LifeOS</span></div><div className="crumb"><span>Personal</span><ChevronRight size={15}/><b>{page}</b></div><div className="header-actions"><button className="today-chip"><Clock3 size={15}/>{dateText.format(new Date())}</button><button className="search-btn" onClick={() => setPalette(true)}><Search size={17}/><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-btn notification"><Bell size={18}/><i/></button></div></header>
      {page === 'Home' ? <Dashboard tasks={tasks} completed={complete} nextExam={nextExam} toggleTask={toggleTask} openAdd={() => setAddOpen(true)} /> : page === 'Academics' ? <Academics /> : page === 'Skills' ? <Skills /> : page === 'Abroad' ? <Abroad /> : page === 'Space' ? null : page === 'Calendar' ? <Calendar /> : page === 'Companions' ? null : <ComingSoon page={page} />} 
      <Space active={page === 'Space'} onReturn={()=>setPage('Space')}/>
      <Companions navigate={setPage} pageActive={page === 'Companions'} currentPage={page}/>
    </main>
    {settingsOpen&&<AppSettings close={()=>setSettingsOpen(false)}/>}
    {palette && <CommandPalette close={() => setPalette(false)} go={p => { setPage(p); setPalette(false) }} />}
    {addOpen && <TaskModal value={newTask} setValue={setNewTask} save={submitTask} close={() => setAddOpen(false)} />}
    <div className="theme-picker"><span>Theme</span>{['nordic', 'lavender', 'matcha', 'sakura', 'midnight'].map(t => <button key={t} title={t} onClick={() => setTheme(t)} className={theme === t ? 'selected' : ''}/>)}</div>
  </div>
}

function Dashboard({ tasks, completed, nextExam, toggleTask, openAdd }: { tasks: Task[]; completed: number; nextExam: string; toggleTask: (id: string) => void; openAdd: () => void }) {
  const lifeScore = Math.round(scores.reduce((sum, item) => sum + item.value, 0) / scores.length)
  return <div className="content">
    <section className="welcome"><div><p className="eyebrow">SATURDAY, NOVEMBER 15</p><h1>Good morning, Aditya <span>✦</span></h1><p className="muted">One calm step at a time. You’re building something brilliant.</p></div><button className="primary" onClick={openAdd}><Plus size={18}/> Quick add</button></section>
    <section className="hero-grid">
      <div className="life-card"><div><span className="eyebrow">YOUR LIFEOS SCORE</span><h2>{lifeScore}<em>/100</em></h2><p>Across every path you’re growing.</p><button className="text-button">Adjust weights <ChevronRight size={15}/></button></div><Ring value={lifeScore}/><div className="aurora one"/><div className="aurora two"/></div>
      <div className="countdowns"><Countdown icon="📚" label="First end-term" date="23 Nov 2026" value={nextExam} tone="orange"/><Countdown icon="🎓" label="Chalmers fair" date="6 Dec 2026" value={friendlyCountdown('2026-12-06')} tone="blue"/><Countdown icon="✈️" label="Departure plan" date="Aug 2028" value={friendlyCountdown('2028-08-01')} tone="violet"/></div>
    </section>
    <section className="dashboard-grid">
      <div className="card score-card"><div className="card-title"><div><span className="eyebrow">PROGRESS</span><h3>Your paths</h3></div><button className="icon-btn"><MoreHorizontal size={18}/></button></div><div className="score-list">{scores.map(s => <div className="score-row" key={s.name}><span>{s.name}</span><div className="bar"><i style={{ width: `${s.value}%`, background: s.color }}/></div><b>{s.value}%</b></div>)}</div><button className="subtle-button">View all progress <ChevronRight size={16}/></button></div>
      <div className="card task-card"><div className="card-title"><div><span className="eyebrow">FOCUS</span><h3>Today’s tasks <small>{completed}/{tasks.length}</small></h3></div><button className="icon-btn" onClick={openAdd}><Plus size={18}/></button></div><div className="tasks">{tasks.map(t => <label className={`task ${t.done ? 'done' : ''}`} key={t.id}><button onClick={() => toggleTask(t.id)} aria-label={`Toggle ${t.title}`}>{t.done && <Check size={13}/>}</button><span>{t.title}</span><em>{t.category}</em></label>)}</div><button className="subtle-button" onClick={openAdd}>Add a task <Plus size={16}/></button></div>
      <div className="card study-card"><div className="card-title"><div><span className="eyebrow">STUDY RHYTHM</span><h3>Hours this week</h3></div><b className="increase">↑ 18%</b></div><div className="chart">{studyWeek.map((v, index) => <div className="chart-col" key={index}><i style={{height: `${v}%`}}/><span>{['M','T','W','T','F','S','S'][index]}</span></div>)}</div><div className="study-footer"><span><b>5h 40m</b> focused time</span><span>🔥 4 day streak</span></div></div>
      <div className="card next-card"><div className="card-title"><div><span className="eyebrow">A GENTLE NUDGE</span><h3>Next best action</h3></div><div className="tiny-orb">✦</div></div><div className="nudge"><div className="nudge-icon">📐</div><div><b>Set up your Sem 5 units</b><p>Your first exam is approaching. Mapping your units makes a plan possible.</p></div></div><button className="primary pale">Open Academics <ChevronRight size={16}/></button></div>
    </section>
    <section className="bottom-grid"><div className="card exam-card"><div className="card-title"><div><span className="eyebrow">END-TERM WINDOW</span><h3>23 Nov — 15 Dec 2026</h3></div><span className="status-pill">Planning</span></div><div className="readiness"><div><span>Exam readiness</span><b>18%</b></div><div className="bar big"><i style={{width:'18%'}}/></div></div><div className="subjects"><span>R Programming <i/></span><span>Intro to ML <i/></span><span>Research Writing <i/></span><span>IoT <i/></span></div></div><div className="card abroad-card"><div><span className="eyebrow">2028 STUDY ABROAD</span><h3>Sweden & Denmark</h3><p>Start with clarity, then turn it into a plan.</p></div><div className="abroad-metrics"><span><b>8%</b> readiness</span><span><b>0</b> shortlisted</span><button>Explore <ChevronRight size={15}/></button></div></div></section>
  </div>
}

function Countdown({ icon, label, date, value, tone }: { icon: string; label: string; date: string; value: string; tone: string }) { return <div className={`countdown ${tone}`}><span className="count-icon">{icon}</span><div><small>{label}</small><b>{value}</b><em>{date}</em></div></div> }
function Ring({ value }: { value: number }) { const radius = 46, circumference = 2 * Math.PI * radius; return <div className="ring"><svg viewBox="0 0 112 112"><circle cx="56" cy="56" r={radius}/><circle className="ring-fill" cx="56" cy="56" r={radius} style={{strokeDasharray: circumference, strokeDashoffset: circumference * (1 - value / 100)}}/></svg><span>{value}<small>%</small></span></div> }
function ComingSoon({ page }: { page: Page }) { return <div className="coming"><div className="coming-icon">{page === 'Academics' ? '📚' : page === 'Skills' ? '🧩' : page === 'Abroad' ? '✈️' : page === 'Calendar' ? '🗓️' : '🦉'}</div><span className="eyebrow">LIFEOS · PHASE 1</span><h1>{page}</h1><p>This workspace has its navigation, theme system, and local-first data foundation ready. Its detailed tools are next in the build plan.</p><button className="primary">View build roadmap <ChevronRight size={16}/></button></div> }
function CommandPalette({ close, go }: { close: () => void; go: (page: Page) => void }) { const [query, setQuery] = useState(''); const results = pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase())); return <div className="overlay" onMouseDown={close}><div className="palette" onMouseDown={e => e.stopPropagation()}><div className="palette-input"><Search size={19}/><input autoFocus placeholder="Search pages, tasks, notes…" value={query} onChange={e => setQuery(e.target.value)}/><kbd>ESC</kbd></div><p>JUMP TO</p>{results.map(({label, icon: Icon}) => <button onClick={() => go(label)} key={label}><Icon size={17}/>{label}<span>Go to page</span></button>)}<div className="palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></div></div></div> }
function TaskModal({ value, setValue, save, close }: { value: string; setValue: (v: string) => void; save: () => void; close: () => void }) { return <div className="overlay" onMouseDown={close}><form className="task-modal" onSubmit={e => {e.preventDefault(); save()}} onMouseDown={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={close}><X size={18}/></button><span className="eyebrow">QUICK CAPTURE</span><h2>Add something to your day</h2><input autoFocus value={value} onChange={e => setValue(e.target.value)} placeholder="What would you like to remember?"/><button className="primary" type="submit">Add task <Plus size={17}/></button></form></div> }
