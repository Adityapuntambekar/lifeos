import assert from 'node:assert/strict'
import {voiceConfiguration} from '../server/voiceConfig.mjs'
const config=voiceConfiguration({STUN_URLS:'stun:example.test:3478',TURN_URLS:'turn:example.test:3478',TURN_SECRET:'test-only-secret'},1700000000000)
assert.equal(config.iceServers.length,2);assert.equal(config.iceServers[1].username,'1700000600');assert.ok(config.iceServers[1].credential);assert.ok(!JSON.stringify(config).includes('test-only-secret'));assert.deepEqual(voiceConfiguration({}).iceServers,[])
console.log('Voice configuration checks passed: expiring TURN credentials and master-secret exclusion.')
