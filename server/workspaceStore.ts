import {mkdirSync,readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash,randomBytes} from 'node:crypto'
import {validStudio,type StudioWorld} from '../shared/studioWorld.ts'
export type SavedWorkspace={version:1;name:string;ownerHash:string;studio:StudioWorld;revision:number}
export const identityHash=(token:string)=>createHash('sha256').update(token).digest('hex')
export const validIdentity=(token:unknown):token is string=>typeof token==='string'&&/^[a-f0-9]{64}$/.test(token)
export class WorkspaceStore {
 readonly directory:string
 constructor(directory:string){this.directory=resolve(directory);mkdirSync(this.directory,{recursive:true})}
 private file(id:string){if(!/^[a-zA-Z0-9-]{8,80}$/.test(id))throw Error('Invalid workspace identifier');return resolve(this.directory,id+'.json')}
 read(id:string):SavedWorkspace|null{const path=this.file(id);if(!existsSync(path))return null;let v:SavedWorkspace;try{v=JSON.parse(readFileSync(path,'utf8'))}catch{throw Error('The saved workspace is unreadable. It has not been overwritten.')}
  if(v?.version!==1||typeof v.name!=='string'||v.name.length>60||!validIdentity(v.ownerHash)||!Number.isSafeInteger(v.revision)||v.revision<0||!validStudio(v.studio))throw Error('The saved workspace is invalid. It has not been overwritten.');return v
 }
 write(id:string,value:SavedWorkspace){const path=this.file(id),temp=path+'.'+randomBytes(6).toString('hex')+'.tmp';writeFileSync(temp,JSON.stringify(value),{encoding:'utf8',mode:0o600,flush:true});renameSync(temp,path)}
}
