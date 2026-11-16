import {spawn} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {dirname,join} from 'node:path'
import {mkdirSync} from 'node:fs'
const root=dirname(fileURLToPath(import.meta.url)),data=join(process.env.LOCALAPPDATA||root,'LifeOSBeta','workspaces')
mkdirSync(data,{recursive:true})
const child=spawn(process.execPath,['server/start.mjs'],{cwd:root,env:{...process.env,HOST:'127.0.0.1',PORT:'5173',LIFEOS_DATA_DIR:data},stdio:['inherit','pipe','inherit'],windowsHide:true})
let opened=false
child.stdout.on('data',chunk=>{process.stdout.write(chunk);if(!opened&&String(chunk).includes('listening on port')){opened=true;console.log('Keep this window open. Close it or press Ctrl+C to stop LifeOS.');const browser=spawn('cmd.exe',['/d','/c','start','','http://localhost:5173'],{windowsHide:true,stdio:'ignore'});browser.on('error',()=>console.log('Open http://localhost:5173 in Chrome or Edge.'))}})
child.on('error',error=>{console.error(error.message);process.exitCode=1})
child.on('exit',code=>{if(code)console.error('Close other LifeOS servers using port 5173, then try again.');process.exitCode=code||0})
process.on('SIGINT',()=>child.kill())
