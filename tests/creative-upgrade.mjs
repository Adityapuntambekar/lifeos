import assert from 'node:assert/strict'
import {noteGraph,neighborhood,graphPositions} from '../src/noteGraphModel.ts'
import {roomPreset,validRoom} from '../src/personalRoomModel.ts'
import {parseBackup} from '../src/backup.ts'
import {seats,route,canStep,canHear,walkable} from '../shared/spaceWorld.ts'
const note=(id,title,body='',extra={})=>({id,title,body,text:body,mode:'knowledge',tags:[],folder:'',pinned:false,created:1,updated:1,deleted:null,...extra})
const graph=noteGraph([note('a','Alpha','[[Beta|alias]] [[Beta]] [[Missing]] `[[Not a link]]`'),note('b','Beta','[[Gamma]]'),note('c','Gamma'),note('d','Alone'),note('e','Deleted','',{deleted:2}),note('f','Private creative','',{mode:'creative'})])
assert.equal(graph.nodes.length,4);assert.deepEqual(graph.edges,[{from:'a',to:'b'},{from:'b',to:'c'}]);assert.deepEqual(graph.missing,[{from:'a',title:'Missing'}]);assert.deepEqual([...neighborhood(graph.edges,'a',1)],['a','b']);assert.deepEqual([...neighborhood(graph.edges,'a',2)],['a','b','c'])
const positions=graphPositions(graph.nodes.map(n=>n.id),graph.edges);assert.equal(Object.keys(positions).length,4);assert.ok(Object.values(positions).every(p=>Number.isFinite(p.x)&&p.x>=40&&p.x<=760&&p.y>=40&&p.y<=480));assert.deepEqual(positions,graphPositions(graph.nodes.map(n=>n.id),graph.edges))
for(const kind of ['library','office','studio']){const room=roomPreset(kind);assert.ok(validRoom(room));assert.deepEqual(parseBackup(JSON.stringify({'lifeos.space.personal':room})).data['lifeos.space.personal'],room)}
const room=roomPreset();assert.equal(validRoom({...room,items:[...room.items,{...room.items[0],id:'duplicate-position'}]}),false);assert.equal(validRoom({...room,items:[{id:'bad',kind:'script',x:1,y:1}]}),false)
for(const seat of seats){assert.ok(walkable(seat.x,seat.y));let pos={x:24,y:74};for(const step of route(pos,seat)){assert.ok(canStep(pos,step));pos=step}assert.equal(pos.x,seat.x);assert.equal(pos.y,seat.y)}
assert.equal(canHear({x:20,y:70,zone:'lounge',personal:true},{x:20,y:70,zone:'lounge'}),false)
console.log('Creative model checks passed: real link topology, aliases/code/trash exclusion, graph depth/layout, room schemas/backups, seat paths and solo-room voice isolation.')
