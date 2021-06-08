import { ipcRenderer } from 'electron'
import { EventEmitter } from 'events'
import pkg from 'package.json'
import { WB_IENGINE_MESSAGE_BACKGROUND_ } from 'shared/ipcEvents'
import semver from 'semver'
import escapeHTML from 'escape-html'
import uuid from 'uuid'
import querystring from 'querystring'
import LiveConfig from 'LiveConfig'

const LIBS = Object.freeze({
  querystring: querystring,
  semver: semver,
  escapeHTML: escapeHTML,
  uuid: uuid
})

const privServiceId = Symbol('privServiceId')
const privImmediateIPCSend = Symbol('privImmediateIPCSend')

class IEngineApi extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param serviceId: the id of the service we're working on behalf of
  * @param storeConnections: the store connections to use
  */
  constructor (serviceId) {
    super()

    this[privServiceId] = serviceId

    // On page load electron is okay sending IPC messages, but returning them
    // immediately to the sender is a no-go. To work around this defer any
    // messages that are sent on startup until the next tick
    this[privImmediateIPCSend] = false
    setTimeout(() => {
      this[privImmediateIPCSend] = true
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get appVersion () { return pkg.version }
  get platform () { return LiveConfig.platform }
  get serviceId () { return this[privServiceId] }
  get LIBS () { return LIBS }

  /* **************************************************************************/
  // Messaging
  /* **************************************************************************/

  /**
  * Sends a message to the foreground impl
  * @param ...args: an array of args to send
  */
  sendBackgroundMessage (...args) {
    const payload = [
      `${WB_IENGINE_MESSAGE_BACKGROUND_}${this[privServiceId]}`,
      { sender: 'foreground' },
      JSON.stringify(args)
    ]
    if (this[privImmediateIPCSend]) {
      ipcRenderer.send(...payload)
    } else {
      setTimeout(() => { ipcRenderer.send(...payload) })
    }
  }
}

export default IEngineApi
