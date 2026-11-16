import {createHmac} from 'node:crypto'
export function voiceConfiguration(env=process.env,now=Date.now()){
 const iceServers=[]
 const stun=(env.STUN_URLS||'').split(',').map(s=>s.trim()).filter(s=>/^stuns?:[^\s]+$/.test(s))
 if(stun.length)iceServers.push({urls:stun})
 const urls=(env.TURN_URLS||'').split(',').map(s=>s.trim()).filter(s=>/^turns?:[^\s]+$/.test(s))
 if(urls.length&&env.TURN_SECRET){const username=String(Math.floor(now/1000)+600);iceServers.push({urls,username,credential:createHmac('sha1',env.TURN_SECRET).update(username).digest('base64')})}
 return {iceServers}
}
