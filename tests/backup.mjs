import assert from 'node:assert/strict'
import {parseBackup,makeBackup,applyBackup} from '../src/backup.ts'
class Store{data=new Map();fail=false;get length(){return this.data.size}key(i){return [...this.data.keys()][i]}getItem(k){return this.data.get(k)??null}setItem(k,v){if(this.fail&&k==='lifeos.theme'){this.fail=false;throw Error('quota')}this.data.set(k,v)}removeItem(k){this.data.delete(k)}}
const store=new Store();store.setItem('lifeos.tasks',JSON.stringify([{id:'1',title:'Read',category:'Study',done:false}]));store.setItem('foreign','keep');store.setItem('lifeos.companions.ai','private-settings')
store.setItem('lifeos.skills.activeTab','AI / ML')
const backup=makeBackup(store);assert.ok(!backup.includes('private-settings'));assert.equal(parseBackup(backup).data['lifeos.tasks'][0].title,'Read');assert.equal(parseBackup(backup).data['lifeos.skills.activeTab'],'AI / ML')
assert.throws(()=>parseBackup('{"lifeos.tasks":{}}'));assert.throws(()=>parseBackup('{"lifeos.calendar.events":[{"id":"x"}]}'));assert.throws(()=>parseBackup('{"lifeos.abroad.readiness":[]}'));assert.throws(()=>parseBackup('{"format":"lifeos-backup","version":99,"data":{}}'))
const before=store.getItem('lifeos.tasks');store.fail=true;assert.throws(()=>applyBackup(store,{'lifeos.tasks':[],'lifeos.theme':'matcha'}));assert.equal(store.getItem('lifeos.tasks'),before);assert.equal(store.getItem('lifeos.theme'),null);assert.equal(store.getItem('foreign'),'keep')
applyBackup(store,{'lifeos.tasks':[],'lifeos.skills.activeTab':'Programming'});assert.equal(store.getItem('lifeos.tasks'),'[]');assert.equal(store.getItem('lifeos.skills.activeTab'),'Programming');assert.equal(store.getItem('lifeos.companions.ai'),'private-settings')
console.log('Backup tests passed: legacy/versioned files, validation, excluded configuration, rollback and section merge.')
