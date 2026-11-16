import {useSyncExternalStore} from 'react'
import {validStoredValue} from './backup'
const warnings=new Map<string,string>(),listeners=new Set<()=>void>()
let snapshot=''
function warn(key:string,message:string){warnings.set(key,message);const next=[...warnings.values()].join('\n');if(snapshot===next)return;snapshot=next;queueMicrotask(()=>listeners.forEach(fn=>fn()))}
export function readSaved<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);if(raw===null)return fallback;const value=JSON.parse(raw);if(!validStoredValue(key,value))throw Error('Invalid saved value');return value as T}catch{warn(key,`${key}: saved data cannot be read. The original is preserved; restore a backup in Calendar.`);return fallback}}
export function writeSaved(key:string,raw:string):void{try{const old=localStorage.getItem(key);if(old!==null&&!validStoredValue(key,JSON.parse(old)))throw Error('Invalid existing value');const next=JSON.parse(raw);if(!validStoredValue(key,next))throw Error('Invalid new value');localStorage.setItem(key,raw);if(warnings.delete(key)){snapshot=[...warnings.values()].join('\n');queueMicrotask(()=>listeners.forEach(fn=>fn()))}}catch{warn(key,`${key}: changes could not be saved. Keep this window open and back up your data; existing saved values were preserved.`)}}
export function StorageNotice(){const message=useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>snapshot,()=>snapshot);return message?<div role="alert" className="storage-warning">{message}</div>:null}
