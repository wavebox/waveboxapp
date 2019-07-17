import { EventEmitter } from 'events'

const KRXFramework = process.electronBinding('KRXFramework')
const emitter = new EventEmitter()
KRXFramework.shimEmitter(emitter, { emit: 'emit' })
KRXFramework.enableBrowserActionAPI()
KRXFramework.enableEntryAPI()
module.exports = emitter
