export type UnitRequest = { course: string; name: string }
export function parseUnitRequest(text:string):UnitRequest|null {
 const match=text.trim().replace(/[.!?]+$/,'').match(/\b(?:add|create|make)\s+(?:me\s+)?(?:an?\s+)?(?:unit|topic|skill)\s+(?:for|in|under|to)\s+(.+?)(?:\s+(?:called|named|titled)\s+(.+))?$/i)
 return match?{course:match[1].trim(),name:(match[2]||'').trim()}:null
}
export const normalise=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'')
export function skillTrack(course:string):string|undefined {
 const aliases:Record<string,string>={aiml:'AI / ML',ai:'AI / ML',artificialintelligence:'AI / ML',programming:'Programming',coding:'Programming',maths:'Maths & stats',mathsstats:'Maths & stats',mathsstatistics:'Maths & stats',aptitude:'Aptitude'}
 return aliases[normalise(course)]
}
type SkillNode={id:string;title:string;done?:boolean;children?:SkillNode[]}
type Subject={id:string;title:string;units:{id:string;name:string;status:string;complete:boolean;difficulty:number}[]}
export function addLearningUnit(request:UnitRequest):{text:string;destination:'Skills'|'Academics'} {
 const track=skillTrack(request.course)
 const name=request.name.trim().replace(/^(?:call it|name it|called|named)\s+/i,'').replace(/^["“]|["”]$/g,'')
 if(!name)throw new Error('A name is required')
 if(track){
   const tree=JSON.parse(localStorage.getItem('lifeos.skills.tree')||'null') as Record<string,SkillNode[]>|null
   if(!tree||!Array.isArray(tree[track]))return {text:'Open Skills once to initialise your learning tree, then ask me again. Nothing was added yet.',destination:'Skills'}
   if(tree[track].some(node=>normalise(node.title)===normalise(name)))return {text:`“${name}” already exists in Skills → ${track}.`,destination:'Skills'}
   tree[track].push({id:crypto.randomUUID(),title:name,done:false})
   localStorage.setItem('lifeos.skills.tree',JSON.stringify(tree))
   localStorage.setItem('lifeos.skills.activeTab',track)
   window.dispatchEvent(new Event('lifeos-skills-updated'))
   return {text:`Done! I added “${name}” to Skills → ${track}. You’ll find it at the bottom of that track’s learning tree.`,destination:'Skills'}
 }
 const subjects=JSON.parse(localStorage.getItem('lifeos.academics.subjects')||'[]') as Subject[]
 const aliases:Record<string,string>={r:'rprogramming',ml:'introductiontomachinelearning',iot:'internetofthings'}
 const query=aliases[normalise(request.course)]||normalise(request.course)
 const subject=subjects.find(item=>normalise(item.title)===query)
 if(!subject)return {text:`I couldn’t find a subject called “${request.course}”. Nothing was added. Open Academics and use its exact subject name, or use AI/ML, Programming, Maths or Aptitude for a Skills track.`,destination:'Academics'}
 if(subject.units.some(unit=>normalise(unit.name)===normalise(name)))return {text:`“${name}” already exists under ${subject.title}.`,destination:'Academics'}
 subject.units.push({id:crypto.randomUUID(),name,status:'Not started',complete:false,difficulty:2})
 localStorage.setItem('lifeos.academics.subjects',JSON.stringify(subjects))
 window.dispatchEvent(new Event('lifeos-academics-updated'))
 return {text:`Done! I added “${name}” to ${subject.title}. Find it in Academics → Overview → expand ${subject.title}.`,destination:'Academics'}
}
