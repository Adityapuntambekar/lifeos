import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {startFresh,restorePersonalArchive,resetArchiveKey} from '../src/freshWorkspace.ts'
const storage=new JSDOM('',{url:'http://localhost'}).window.localStorage
const old={'lifeos.academics.subjects':'[{"title":"R"}]','lifeos.skills.tree':'{"Programming":[]}','lifeos.space.identity':'keep-owner-key','lifeos.tasks':'["personal assignment"]','lifeos.abroad.unis':'["KTH"]','lifeos.companions.chat':'["old conversation"]','other-app':'untouched'}
Object.entries(old).forEach(([key,value])=>storage.setItem(key,value));startFresh(storage)
for(const key of ['lifeos.academics.subjects','lifeos.skills.tree','lifeos.space.identity','other-app'])assert.equal(storage.getItem(key),old[key])
for(const key of ['lifeos.tasks','lifeos.abroad.unis','lifeos.companions.chat'])assert.equal(storage.getItem(key),null)
assert.ok(storage.getItem(resetArchiveKey));assert.throws(()=>startFresh(storage),/archive already exists/)
storage.setItem('lifeos.tasks','["new task"]');restorePersonalArchive(storage);assert.equal(storage.getItem('lifeos.abroad.unis'),old['lifeos.abroad.unis']);restorePersonalArchive(storage);assert.equal(storage.getItem('lifeos.tasks'),'["new task"]');assert.equal(storage.getItem('lifeos.abroad.unis'),null)
console.log('Fresh workspace tests passed: Academics/Skills/ownership preserved, personal sections archived, reversible swap, no silent archive overwrite.')
