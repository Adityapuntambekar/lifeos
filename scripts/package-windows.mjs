import {cpSync,mkdirSync,readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs'
import {resolve,join} from 'node:path'
const root=resolve('.'),output=resolve('outputs','LifeOS-Windows-Beta-2026-11-17')
mkdirSync(output,{recursive:true})
if(!existsSync('work/release-licenses/NODE-LICENSE.txt')){mkdirSync('work/release-licenses',{recursive:true});const response=await fetch(`https://raw.githubusercontent.com/nodejs/node/${process.version}/LICENSE`);if(!response.ok)throw Error('Could not obtain Node redistribution license');writeFileSync('work/release-licenses/NODE-LICENSE.txt',await response.text())}
for(const folder of ['dist'])cpSync(join(root,folder),join(output,folder),{recursive:true})
for(const folder of ['server','shared']){mkdirSync(join(output,folder),{recursive:true});for(const file of readdirSync(folder).filter(n=>/\.(ts|mjs)$/.test(n)&&!n.endsWith('.d.ts')))cpSync(join(folder,file),join(output,folder,file))}
mkdirSync(join(output,'node_modules'),{recursive:true});cpSync('node_modules/ws',join(output,'node_modules/ws'),{recursive:true});cpSync(process.execPath,join(output,'node.exe'))
writeFileSync(join(output,'package.json'),JSON.stringify({name:'lifeos-portable-beta',private:true,type:'module'},null,2))
cpSync('scripts/launch-portable.mjs',join(output,'launch.mjs'))
writeFileSync(join(output,'Start LifeOS.bat'),'@echo off\r\ncd /d "%~dp0"\r\nnode.exe launch.mjs\r\nif errorlevel 1 pause\r\n')
cpSync('docs/FRIEND_BETA.md',join(output,'READ ME FIRST.md'))
mkdirSync(join(output,'licenses'),{recursive:true});cpSync('work/release-licenses/NODE-LICENSE.txt',join(output,'licenses/NODE-LICENSE.txt'))
let notice='LifeOS beta third-party software notices\nNode '+process.version+' is bundled. See NODE-LICENSE.txt.\n\n'
function packages(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){if(!entry.isDirectory()||entry.name.startsWith('.'))continue;const p=join(dir,entry.name);if(entry.name.startsWith('@')){packages(p);continue}if(!existsSync(join(p,'package.json')))continue;const meta=JSON.parse(readFileSync(join(p,'package.json'),'utf8'));notice+=`${meta.name} ${meta.version} (${typeof meta.license==='string'?meta.license:'see package license'})\n`;for(const file of readdirSync(p).filter(n=>/^(license|licence|copying|notice)(\.|$)/i.test(n))){try{const text=readFileSync(join(p,file),'utf8');notice+=text+'\n\n'}catch{}}if(existsSync(join(p,'node_modules')))packages(join(p,'node_modules'))}}
packages('node_modules');writeFileSync(join(output,'licenses/THIRD-PARTY-NOTICES.txt'),notice)
console.log(output)
