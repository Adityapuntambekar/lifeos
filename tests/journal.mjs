import assert from 'node:assert/strict'
import {validJournal,emptyJournal,linkedTitles,renameNote,uniqueTitle,localDay} from '../src/journalModel.ts'
import {parseBackup} from '../src/backup.ts'
const note=(id,title,body='',mode='knowledge')=>({id,title,body,text:body,mode,folder:'',tags:[],pinned:false,created:1,updated:1,deleted:null})
const store={folders:[],notes:[note('a','Alpha'),note('b','Beta','See [[Alpha]] and [[Alpha|my idea]].\n```js\n[[Alpha]]\n```\n`[[Alpha]]`'),note('c','Diary','<p>Alpha</p>','creative')]}
assert.ok(validJournal(store));assert.ok(validJournal(emptyJournal()));assert.equal(validJournal({notes:[{id:'bad'}],folders:[]}),false);assert.equal(validJournal({...store,notes:[store.notes[0],store.notes[0]]}),false)
assert.deepEqual(linkedTitles('[[Alpha]] [[Alpha|alias]] `[[skip]]`\n```\n[[skip too]]\n```\n[[Beta]]'),['Alpha','Beta'])
const renamed=renameNote(store,'a','Gamma');assert.match(renamed.notes[1].body,/\[\[Gamma\|my idea\]\]/);assert.match(renamed.notes[1].body,/`\[\[Alpha\]\]`/);assert.equal(renamed.notes[2].body,'<p>Alpha</p>');assert.equal(store.notes[0].title,'Alpha')
assert.throws(()=>renameNote(store,'a','beta'));assert.throws(()=>renameNote(store,'a','  '));assert.equal(uniqueTitle(store.notes,'knowledge','Alpha'),'Alpha 2');assert.equal(uniqueTitle(store.notes,'creative','Alpha'),'Alpha')
assert.equal(localDay(new Date(2026,0,2,0,5)),'2026-01-02');assert.ok(parseBackup(JSON.stringify({'lifeos.journal':store})).data['lifeos.journal']);assert.throws(()=>parseBackup(JSON.stringify({'lifeos.journal':{notes:null}})))
console.log('Journal checks passed: schema, unique IDs/titles, links and aliases, rename propagation without code changes, local dates and backup validation.')
