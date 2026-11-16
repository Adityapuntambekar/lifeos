export type DeskCheckpoint={version:1;roomId:string;seatId:string;taskId:string;noteId:string;reflection:string;updated:number}
export const emptyDesk=():DeskCheckpoint=>({version:1,roomId:'',seatId:'',taskId:'',noteId:'',reflection:'',updated:0})
export function validDesk(v:any):v is DeskCheckpoint{return !!v&&v.version===1&&['roomId','seatId','taskId','noteId','reflection'].every(k=>typeof v[k]==='string')&&v.reflection.length<=2000&&Number.isFinite(v.updated)&&v.updated>=0}
export type SavedPlace={id:string;name:string;visited:number}
export function validPlaces(v:any):v is SavedPlace[]{return Array.isArray(v)&&v.length<=50&&v.every(p=>p&&typeof p.id==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(p.id)&&typeof p.name==='string'&&p.name.length<=60&&Number.isFinite(p.visited))}
export function browserIdentity(){const key='lifeos.space.identity',saved=localStorage.getItem(key);if(saved&&/^[a-f0-9]{64}$/.test(saved))return saved;const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem(key,token);return token}
