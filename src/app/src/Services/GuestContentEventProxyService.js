import { app } from 'electron'

const EVT_PREFIX = 'wcpxy'

const privConnected = Symbol('privConnected')

class GuestContentEventProxyService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Set()
    app.on('web-contents-created', this._handleWebContentsCreated)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles a webcontents being created by binding the event pass-throughs to it
  * @param evt: the event that fired
  * @param contents: the contents that were created
  */
  _handleWebContentsCreated = (evt, contents) => {
    const webContentsId = contents.id
    if (this[privConnected].has(webContentsId)) { return }
    this[privConnected].add(webContentsId)

    contents.on('dom-ready', (evt) => { evt.sender.send(`${EVT_PREFIX}-dom-ready`, evt.sender.id) })
    contents.on('destroyed', () => {
      this[privConnected].delete(webContentsId)
    })
  }
}

export default GuestContentEventProxyService
