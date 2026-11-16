import http from 'node:http'
import {readFile} from 'node:fs/promises'
import {resolve,extname,sep} from 'node:path'
import {attachSpace} from './space.ts'
const root=resolve('dist');const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let file=resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}if(url.pathname==='/'||!extname(file))file=resolve(root,'index.html');const content=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(content)}catch{res.writeHead(404);res.end('Not found')}})
attachSpace(server,{directory:process.env.LIFEOS_DATA_DIR||'data/workspaces'});server.listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('LifeOS shared space server listening on port '+(process.env.PORT||4173)))
