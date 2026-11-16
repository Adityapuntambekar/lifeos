export type Destination = 'Journal' | 'Home' | 'Academics' | 'Skills' | 'Abroad' | 'Calendar' | 'Space'
export type GuideReply = { text: string; destination?: Destination }
export function guide(question: string, history: string[]): GuideReply | null {
  const q = question.toLowerCase()
  if (/\b(add|create|make)\b/.test(q)) return null
  if (/where|find it|show me|take me|open|go to|how/.test(q)) {
    if (/journal|notes|writing|diary|graph|markdown|backlinks/.test(q)) return {text:'Open Journal. Journal & create has rich text and daily pages; Think & connect has Markdown, [[note links]], backlinks and a Knowledge atlas with whole-notebook and local graphs, tags, zoom and draggable nodes. Notes save on this device. Journal contents are not sent to the companion AI.',destination:'Journal'}
    if (/space|garden|friends|meeting|\bsit\b|chair|room|library|office/.test(q)) return {text:'Open Space to join the Study Garden. Friends need the same server and invite code. Click a chair to walk over and sit. My room opens your solo room with furniture, themes and library/office/studio templates. Use the quiet library for solo study, or opt into voice in a group zone.',destination:'Space'}
    if (/ai\s*\/\s*ml|programming|aptitude|maths/.test(q)) return {text:'Open Skills and choose the matching track at the top. Newly added learning topics appear at the bottom of its tree.',destination:'Skills'}
    const last = [...history].reverse().find(line => line.includes('Done! I added'))
    const context = /\bit\b|where|show me/.test(q) && !/academics|skills|abroad|calendar|home/.test(q) ? last || '' : ''
    if (/unit|academics|syllabus|semester/.test(q) || context.includes(' to ') && !context.includes('your tasks')) return { text: context ? `${context.slice(context.indexOf('Done!'))} Find it in Academics → Overview → expand the subject with its arrow. The unit appears at the bottom of that subject’s unit list.` : 'Open Academics → Overview, then expand your subject using its arrow. Your units are listed underneath.', destination: 'Academics' }
    if (/assignment|task|home/.test(q) || context.includes('your tasks')) return { text: 'Your assignment is a task in Home → Today’s tasks. It is saved locally in this browser. Use the button below to open it.', destination: 'Home' }
    if (/skills|coding|project/.test(q)) return {text:'Open Skills. Use the Programming, AI / ML, Maths & stats, Aptitude, or Projects tabs.',destination:'Skills'}
    if (/abroad|universit|map|budget/.test(q)) return {text:'Open Abroad. Explore map contains the university cards; Pipeline, Readiness and Budget have their own tabs.',destination:'Abroad'}
    if (/calendar|event/.test(q)) return {text:'Open Calendar. Use Month for dates and Agenda for the event list and delete controls.',destination:'Calendar'}
    return {text:'What would you like to find—a task, a subject unit, a project, a university, or a calendar event?'}
  }
  if (/help|can you do|how.*work/.test(q)) return {text:'I can add assignments to Home tasks, add named units to existing subjects, and guide you around LifeOS. Try “add a unit for R called functions”, then “where can I find it?”. I use local commands; I don’t yet have a connected AI model for open-ended questions.'}
  if (/hello|^hi\b|thank/.test(q)) return {text:'I’m here! Tell me what you want to add or where you want to go. I’ll explain what changed and where it lives.'}
  return {text:'I’m not sure how to carry out that request yet, so I haven’t changed anything. I can add assignments, add subject units, and show you where to find them. Could you name the item or workspace you mean?'}
}
