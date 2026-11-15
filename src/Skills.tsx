import { useEffect, useState, type CSSProperties } from 'react'
import { Check, ChevronDown, ChevronRight, Code2, ExternalLink, Flame, GitBranch, GripVertical, Plus, Sparkles, Target, Trash2, Trophy, X } from 'lucide-react'

type Node = { id: string; title: string; done?: boolean; children?: Node[] }
type TrackKey = 'Programming' | 'AI / ML' | 'Maths & stats' | 'Aptitude'
type Tree = Record<TrackKey, Node[]>
type Problem = { id: string; title: string; topic: string; difficulty: 'Easy' | 'Medium' | 'Hard'; date: string; status: 'Solved' | 'Revisit' | 'Attempted' }
type Project = { id: string; title: string; stack: string; status: 'Planned' | 'In progress' | 'Done'; metric: string; ready: boolean }

const leaf = (title: string): Node => ({ id: crypto.randomUUID(), title, done: false })
const group = (title: string, topics: [string, string[]][]): Node => ({ id: crypto.randomUUID(), title, children: topics.map(([topic, subtopics]) => ({ id: crypto.randomUUID(), title: topic, children: subtopics.map(leaf) })) })
export const seedTree = (): Tree => ({
  'Programming': [
    group('Python', [['Core language', ['Syntax & data structures', 'Functions & modules', 'OOP']], ['Advanced Python', ['Iterators & generators', 'Decorators', 'Async & concurrency']], ['Quality & delivery', ['Testing', 'Packaging', 'Performance']]]),
    group('C++', [['Core', ['Basics & STL', 'OOP', 'Memory & pointers']], ['Competitive foundations', ['Templates', 'Common idioms']]]),
    group('DSA', [['Arrays & strings', ['Complexity analysis', 'Hashing', 'Two pointers & sliding window']], ['Core structures', ['Linked lists', 'Stacks & queues', 'Trees & tries', 'Heaps']], ['Graphs & advanced', ['BFS / DFS', 'Shortest paths & MST', 'Dynamic programming', 'Greedy & bit manipulation']]]),
    group('Engineering essentials', [['Data & tooling', ['SQL', 'Git / GitHub', 'Linux / CLI']], ['Interviews', ['System design basics', 'OOP & design patterns', 'OS / DBMS / CN']]])
  ],
  'AI / ML': [
    group('Foundations', [['Workflow', ['Data cleaning', 'EDA', 'Feature engineering']], ['Theory', ['Bias / variance', 'Validation', 'Metrics']]]),
    group('Classical ML', [['Supervised learning', ['Linear & logistic regression', 'SVM', 'Trees, forests & boosting']], ['Unsupervised & specialised', ['Clustering', 'PCA / t-SNE / UMAP', 'Time series & recommenders']]]),
    group('Deep learning', [['Neural networks', ['MLP & backprop', 'Optimizers & normalization', 'CNNs and RNNs']], ['Modern models', ['Attention & Transformers', 'Diffusion & GANs', 'PyTorch / TensorFlow']]]),
    group('GenAI & LLMs', [['LLM building blocks', ['Prompt engineering', 'RAG & vector databases', 'Fine-tuning / PEFT']], ['Production practice', ['Quantization & inference', 'Guardrails', 'LLM evaluation']]]),
    group('Agentic AI', [['Agent systems', ['Tool use & function calling', 'Planning / ReAct & memory', 'Multi-agent systems']], ['Frameworks & safety', ['MCP', 'LangChain / LangGraph', 'Agent evaluation & safety']]]),
    group('Specialisations', [['Vision & NLP', ['YOLO & segmentation', 'Embeddings & BERT', 'Multimodal models']], ['Research interests', ['SNN / LIF neurons', 'snnTorch & datasets', 'Reinforcement learning']], ['MLOps & Big Data', ['Docker / FastAPI / MLflow', 'Spark / PySpark / Kafka', 'Model serving & monitoring']]])
  ],
  'Maths & stats': [
    group('Linear algebra', [['Vectors & matrices', ['Matrix operations', 'Eigenvalues & eigenvectors', 'SVD and PCA derivation']]]),
    group('Calculus & optimisation', [['Calculus', ['Derivatives & gradients', 'Jacobian / Hessian', 'Chain rule']], ['Optimisation', ['Gradient descent variants', 'Convexity', 'Lagrange / KKT']]]),
    group('Probability & statistics', [['Probability', ['Distributions', 'Bayes, MLE & MAP', 'Expectation & CLT']], ['Statistics', ['Hypothesis testing', 'Confidence intervals', 'A/B testing & Bayesian stats']]]),
    group('Further foundations', [['Theory', ['Information theory', 'Discrete maths', 'Numerical methods']], ['Practice', ['Formula sheets', 'Derive-it-yourself', 'Practice problem log']]])
  ],
  'Aptitude': [
    group('Quantitative', [['Arithmetic', ['Percentages & ratios', 'Time, speed & work', 'Number systems']], ['Higher quant', ['Probability & P&C', 'Algebra & geometry']]]),
    group('Reasoning & verbal', [['Reasoning', ['Logical reasoning', 'Data interpretation', 'Puzzles']], ['Communication', ['Verbal ability', 'Reading comprehension']]]),
    group('Mock-test system', [['Review loop', ['Weekly target', 'Accuracy tracking', 'Weak-area review']]])
  ]
})
const defaultProblems: Problem[] = [{ id: 'p1', title: 'Two Sum', topic: 'Hashing', difficulty: 'Easy', date: '2026-11-15', status: 'Solved' }]
export const defaultProjects: Project[] = [
  { id: 'pr1', title: 'GenAI / RAG system', stack: 'Python · LLM · Vector DB', status: 'In progress', metric: '', ready: false },
  { id: 'pr2', title: 'NLP project', stack: 'Python · PyTorch · NLP', status: 'Planned', metric: '', ready: false },
  { id: 'pr3', title: 'Spiking neural network project', stack: 'snnTorch · Research', status: 'Planned', metric: '', ready: false },
  { id: 'pr4', title: 'AWS Hackathon finalist entry', stack: 'AWS · Applied AI', status: 'Done', metric: 'Finalist', ready: true },
]
function read<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback } }
const descendants = (node: Node): Node[] => node.children ? node.children.flatMap(child => [child, ...descendants(child)]) : []
const progress = (node: Node) => { const leaves = node.children ? descendants(node).filter(item => !item.children?.length) : [node]; return leaves.length ? Math.round(leaves.filter(item => item.done).length / leaves.length * 100) : 0 }
const allProgress = (nodes: Node[]) => { const leaves = nodes.flatMap(node => [node, ...descendants(node)]).filter(node => !node.children?.length); return leaves.length ? Math.round(leaves.filter(node => node.done).length / leaves.length * 100) : 0 }

export default function Skills() {
  const [tab, setTab] = useState<TrackKey | 'Projects'>(() => {
    const saved=localStorage.getItem('lifeos.skills.activeTab')
    return ['Programming','AI / ML','Maths & stats','Aptitude','Projects'].includes(saved||'') ? saved as TrackKey : 'Programming'
  })
  const [tree, setTree] = useState<Tree>(() => read('lifeos.skills.tree', seedTree()))
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [problems, setProblems] = useState<Problem[]>(() => read('lifeos.skills.problems', defaultProblems))
  const [projects, setProjects] = useState<Project[]>(() => read('lifeos.skills.projects', defaultProjects))
  const [stats, setStats] = useState(() => read('lifeos.skills.stats', { username: '', easy: 0, medium: 0, hard: 0, streak: 0, rating: 0 }))
  useEffect(() => localStorage.setItem('lifeos.skills.tree', JSON.stringify(tree)), [tree])
  useEffect(() => {
    const refresh=()=>{setTree(read('lifeos.skills.tree',seedTree()));const target=localStorage.getItem('lifeos.skills.activeTab');if(target&&['Programming','AI / ML','Maths & stats','Aptitude'].includes(target))setTab(target as TrackKey)}
    window.addEventListener('lifeos-skills-updated',refresh)
    return ()=>window.removeEventListener('lifeos-skills-updated',refresh)
  },[])
  useEffect(() => localStorage.setItem('lifeos.skills.problems', JSON.stringify(problems)), [problems])
  useEffect(() => localStorage.setItem('lifeos.skills.projects', JSON.stringify(projects)), [projects])
  useEffect(() => localStorage.setItem('lifeos.skills.stats', JSON.stringify(stats)), [stats])
  useEffect(()=>{
    const refresh=()=>setProjects(read('lifeos.skills.projects',defaultProjects))
    window.addEventListener('lifeos-data-updated',refresh)
    return()=>window.removeEventListener('lifeos-data-updated',refresh)
  },[])
  useEffect(()=>{
    const reveal=()=>{
      const id=localStorage.getItem('lifeos.companions.context.Skills');if(!id)return
      if(read<Project[]>('lifeos.skills.projects',[]).some(item=>item.id===id)){setTab('Projects');return}
      const current=read<Tree>('lifeos.skills.tree',seedTree());const expanded=new Set<string>()
      const find=(nodes:Node[]):boolean=>nodes.some(node=>{if(node.id===id){expanded.add(node.id);return true}if(node.children&&find(node.children)){expanded.add(node.id);return true}return false})
      for(const [track,nodes] of Object.entries(current))if(id===`track:${track}`||find(nodes)){setTab(track as TrackKey);setOpen(expanded);return}
    }
    reveal();window.addEventListener('lifeos-reveal',reveal)
    return()=>window.removeEventListener('lifeos-reveal',reveal)
  },[])
  const trackProgress = tab === 'Projects' ? 0 : allProgress(tree[tab])
  const setNode = (track: TrackKey, id: string, transform: (node: Node) => Node | null) => setTree(all => ({ ...all, [track]: modify(all[track], id, transform) }))
  const rename = (id: string, value: string) => tab !== 'Projects' && setNode(tab, id, node => ({...node, title:value}))
  const toggle = (id: string) => tab !== 'Projects' && setNode(tab, id, node => flip(node))
  const addChild = (parentId?: string) => { if (tab === 'Projects') return; if (!parentId) { setTree(all => ({...all, [tab]: [...all[tab], {id:crypto.randomUUID(),title:'New category',children:[]}]})); return } setNode(tab, parentId, node => ({...node,children:[...(node.children || []), leaf('New topic')]})) }
  const remove = (id: string) => tab !== 'Projects' && setNode(tab, id, () => null)
  const addProblem = () => setProblems(items => [...items, {id:crypto.randomUUID(), title:'New problem', topic:'General', difficulty:'Easy', date:new Date().toISOString().slice(0,10), status:'Attempted'}])
  const addProject = () => setProjects(items => [...items, {id:crypto.randomUUID(), title:'New project', stack:'', status:'Planned', metric:'', ready:false}])
  return <div className="skills-page">
    <section className="skills-heading"><div><div className="academic-breadcrumb"><Code2 size={14}/> Career / internship track <ChevronRight size={14}/> <b>Skills</b></div><h1>Skills studio</h1><p>A separate, project-led path for the work you want to do.</p></div><div className="skills-total"><span>Career readiness</span><b>{Math.round((allProgress(tree.Programming) + allProgress(tree['AI / ML']) + allProgress(tree['Maths & stats']) + allProgress(tree.Aptitude)) / 4)}%</b></div></section>
    <div className="skills-tabs">{(['Programming','AI / ML','Maths & stats','Aptitude','Projects'] as const).map(item => <button data-companion-id={`track:${item}`} key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Projects' ? <Projects projects={projects} setProjects={setProjects} addProject={addProject}/> : <><section className="skills-hero"><div><span className="eyebrow">{tab.toUpperCase()} TRACK</span><h2>{trackProgress}% of this path is complete</h2><p>Every checkbox rolls progress into your career readiness. Your changes stay on this device.</p></div><div className="skill-hero-progress"><div className="skill-ring" style={{'--value': `${trackProgress * 3.6}deg`} as CSSProperties}><span>{trackProgress}%</span></div><span><Sparkles size={14}/> Local-first</span></div></section>
      <section className="skills-layout"><div className="skill-tree-card"><div className="section-title"><div><span className="eyebrow">EDITABLE KNOWLEDGE TREE</span><h2>{tab}</h2></div><button className="subtle-button compact" onClick={() => addChild()}><Plus size={15}/> Category</button></div><div className="skill-tree">{tree[tab].map(node => <TreeNode key={node.id} node={node} level={0} open={open} setOpen={setOpen} rename={rename} toggle={toggle} addChild={addChild} remove={remove}/>)}</div></div>{tab === 'Programming' ? <CodingPanel stats={stats} setStats={setStats} problems={problems} setProblems={setProblems} addProblem={addProblem}/> : <TrackGuide track={tab}/>}</section></>}
  </div>
}

function modify(nodes: Node[], id: string, transform: (node: Node) => Node | null): Node[] { return nodes.flatMap(node => { if (node.id === id) { const next = transform(node); return next ? [next] : [] } if (node.children) return [{...node, children: modify(node.children, id, transform)}]; return [node] }) }
function flip(node: Node): Node { const next = !node.done; return {...node, done: next, children: node.children?.map(child => mark(child, next))} }
function mark(node: Node, value: boolean): Node { return {...node, done:value, children:node.children?.map(child => mark(child,value))} }
function TreeNode({ node, level, open, setOpen, rename, toggle, addChild, remove }: { node: Node; level: number; open: Set<string>; setOpen: (value: Set<string>) => void; rename: (id: string, value: string) => void; toggle: (id: string) => void; addChild: (id?: string) => void; remove: (id: string) => void }) { const hasChildren = Boolean(node.children); const isOpen = open.has(node.id); const changeOpen = () => { const next = new Set(open); next.has(node.id) ? next.delete(node.id) : next.add(node.id); setOpen(next) }; return <div className={`tree-node level-${level}`} data-companion-id={node.id}><div className="tree-line"><button className="tree-expand" onClick={changeOpen}>{hasChildren ? isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/> : <span/>}</button><button className={`tree-check ${node.done ? 'done' : ''}`} onClick={() => toggle(node.id)}>{node.done && <Check size={12}/>}</button><GripVertical className="tree-grip" size={14}/><input value={node.title} onChange={event => rename(node.id, event.target.value)}/>{hasChildren && <span className="node-progress">{progress(node)}%</span>}<button className="tree-add" title="Add child" onClick={() => addChild(node.id)}><Plus size={14}/></button><button className="delete-row" title="Delete item" onClick={() => remove(node.id)}><Trash2 size={14}/></button></div>{hasChildren && isOpen && <div className="tree-children">{node.children!.map(child => <TreeNode key={child.id} node={child} level={level+1} open={open} setOpen={setOpen} rename={rename} toggle={toggle} addChild={addChild} remove={remove}/>)}</div>}</div> }
function CodingPanel({ stats, setStats, problems, setProblems, addProblem }: { stats: {username:string;easy:number;medium:number;hard:number;streak:number;rating:number}; setStats: (value: typeof stats) => void; problems: Problem[]; setProblems: (items: Problem[]) => void; addProblem: () => void }) { const set = (key: keyof typeof stats, value: string) => setStats({...stats,[key]:key === 'username' ? value : Number(value)}); const completed = problems.filter(item => item.status === 'Solved').length; return <aside className="coding-side"><section className="card coding-stats"><div className="card-title"><div><span className="eyebrow">CODING STATS</span><h3>Practice snapshot</h3></div><Code2 size={18}/></div><label className="profile-field">LeetCode username<input value={stats.username} onChange={event => set('username',event.target.value)} placeholder="Add manually"/></label><div className="solved-grid">{(['easy','medium','hard'] as const).map(key => <label key={key}><span>{key}</span><input type="number" min="0" value={stats[key] || ''} onChange={event => set(key,event.target.value)}/></label>)}</div><div className="coding-detail"><span>🔥 <b>{stats.streak || 0}</b> day streak</span><span>★ <b>{stats.rating || '—'}</b> rating</span></div><small>Manual sync is ready; profile adapters come when external connections are configured.</small></section><section className="card problem-card"><div className="card-title"><div><span className="eyebrow">PROBLEM LOG</span><h3>{completed} solved</h3></div><button className="icon-btn" onClick={addProblem}><Plus size={17}/></button></div><div className="problem-list">{problems.slice(-5).reverse().map(problem => <div className="problem-row" key={problem.id}><input value={problem.title} onChange={event => setProblems(problems.map(item => item.id === problem.id ? {...item,title:event.target.value} : item))}/><select value={problem.status} onChange={event => setProblems(problems.map(item => item.id === problem.id ? {...item,status:event.target.value as Problem['status']} : item))}><option>Solved</option><option>Revisit</option><option>Attempted</option></select><button className="delete-row" onClick={() => setProblems(problems.filter(item => item.id !== problem.id))}><X size={13}/></button></div>)}</div><button className="daily-link" onClick={() => window.open('https://leetcode.com/problemset/', '_blank', 'noopener,noreferrer')}>Daily problem <ExternalLink size={14}/></button></section></aside> }
function TrackGuide({ track }: { track: TrackKey }) { const copy: Record<Exclude<TrackKey,'Programming'>, [string,string,string]> = { 'AI / ML':['Depth tags','Aware → Understood → Implemented → Applied in project → Can teach','Mark the leaf when its current depth changes; project links come in the next refinement.'], 'Maths & stats':['Sem 6 link','Advanced ML overlaps','Use this tree to make maths visibility part of your Semester 6 preparation.'], Aptitude:['Weekly target','Set a focused mock-test rhythm','Log detailed mock scores and trend charts in the next update of this track.'] }; const [label,heading,text] = copy[track as Exclude<TrackKey,'Programming'>]; return <aside className="track-guide card"><span className="eyebrow">{label}</span><h3>{heading}</h3><p>{text}</p><div className="guide-orbits"><i/><i/><i/><span>✦</span></div></aside> }
function Projects({ projects, setProjects, addProject }: { projects: Project[]; setProjects: (items: Project[]) => void; addProject: () => void }) { const statuses: Project['status'][] = ['Planned','In progress','Done']; const ready = projects.filter(project => project.ready && project.metric).length; return <><section className="projects-hero"><div><span className="eyebrow">INDUSTRY-GRADE PROJECTS</span><h2>Make your evidence visible.</h2><p>Projects with a README, demo, and measurable impact strengthen your resume readiness.</p></div><div><b>{ready}/{projects.length}</b><span>resume-ready projects</span></div></section><section className="project-actions"><div><Trophy size={18}/><span><b>AWS Hackathon finalist</b> is already captured in your project board.</span></div><button className="primary" onClick={addProject}><Plus size={17}/> New project</button></section><section className="kanban">{statuses.map(status => <div className="kanban-column" key={status}><div className="kanban-title"><span>{status}</span><b>{projects.filter(project => project.status === status).length}</b></div>{projects.filter(project => project.status === status).map(project => <article className="project-tile" key={project.id} data-companion-id={project.id}><div className="tile-top"><GitBranch size={16}/><button className="delete-row" onClick={() => setProjects(projects.filter(item => item.id !== project.id))}><Trash2 size={14}/></button></div><input value={project.title} onChange={event => setProjects(projects.map(item => item.id === project.id ? {...item,title:event.target.value} : item))}/><input className="project-stack" value={project.stack} placeholder="Stack" onChange={event => setProjects(projects.map(item => item.id === project.id ? {...item,stack:event.target.value} : item))}/><input className="project-metric" value={project.metric} placeholder="Impact metric (optional)" onChange={event => setProjects(projects.map(item => item.id === project.id ? {...item,metric:event.target.value} : item))}/><div className="tile-bottom"><select value={project.status} onChange={event => setProjects(projects.map(item => item.id === project.id ? {...item,status:event.target.value as Project['status']} : item))}>{statuses.map(item => <option key={item}>{item}</option>)}</select><label><input type="checkbox" checked={project.ready} onChange={event => setProjects(projects.map(item => item.id === project.id ? {...item,ready:event.target.checked} : item))}/> Ready</label></div></article>)}</div>)}</section></> }
