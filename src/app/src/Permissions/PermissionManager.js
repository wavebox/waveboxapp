import { EventEmitter } from 'events'
import { session, webContents } from 'electron'
import { guestStore, guestActions } from 'stores/guest'
import { URL } from 'url'

const privManaged = Symbol('privManaged')
const privUnresolvedPermissionRequests = Symbol('privUnresolvedPermissionRequests')

class PermissionManager extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this[privManaged] = new Set()
    this[privUnresolvedPermissionRequests] = new Map()
  }

  /* ****************************************************************************/
  // Permission management
  /* ****************************************************************************/

  /**
  * Adds the partition manager to the given partition
  * @param partition: the partition to listen on
  */
  setupPermissionHandler (partition) {
    if (this[privManaged].has(partition)) { return }

    const ses = session.fromPartition(partition)
    ses.setPermissionRequestHandler(this._handlePermissionRequest)
  }

  /**
  * Removes the partition manager for given partition
  * @param partition: the partition to teardown
  */
  teardownPermissionHandler (partition) {
    if (!this[privManaged].has(partition)) { return }

    const ses = session.fromPartition(partition)
    ses.setPermissionRequestHandler(this._handleUnhandledPermissionRequest)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the permission site from a webcontents
  * @param wc: the webcontents to get the site from
  * @return the site
  */
  getPermissionSiteFromWebContents (wc) {
    const purl = new URL(wc.getURL() || 'about:blank')
    const host = purl.hostname.startsWith('www.') ? purl.hostname.replace('www.', '') : purl.hostname
    return `${purl.protocol}//${host}`
  }

  /**
  * Gets an array of unresolved permission types for a webcontents id
  * @param wcId: the webcontents id
  * @return an array of permission types that are pending
  */
  getUnresolvedPermissionTypes (wcId) {
    return Object.keys(this[privUnresolvedPermissionRequests].get(wcId) || {})
  }

  /* ****************************************************************************/
  // Setters
  /* ****************************************************************************/

  /**
  * Resolves a permission request
  * @param wcId: the webcontents id
  * @param type: the permission type
  * @param permission: the new permission
  */
  resolvePermissionRequest (wcId, type, permission) {
    const wc = webContents.fromId(wcId)
    if (!wc || wc.isDestroyed()) { return }

    const site = this.getPermissionSiteFromWebContents(wc)
    const requests = this[privUnresolvedPermissionRequests].get(wcId) || {}
    const rec = requests[type] || function () {}

    if (permission === 'granted') {
      guestActions.grantPermission(site, type)
      rec(true)
    } else if (permission === 'denied') {
      guestActions.denyPermission(site, type)
      rec(false)
    } else {
      guestActions.deferPermission(site, type)
    }

    delete requests[type]
    this[privUnresolvedPermissionRequests].set(wcId, requests)
    this.emit(
      'unresolved-permission-requests-changed',
      wcId,
      this.getUnresolvedPermissionTypes(wcId)
    )
  }

  /* ****************************************************************************/
  // Permission Handlers
  /* ****************************************************************************/

  /**
  * Handles permissions
  * @param wc: the requesting webcontents
  * @param type: the permission type
  * @param fn: the callback on completion
  */
  _handlePermissionRequest = (wc, type, fn) => {
    if (type === 'notifications') {
      fn(true) // We handle notifications seperately
    } else if (type === 'midiSysex') {
      fn(true)
    } else if (type === 'pointerLock') {
      fn(false)
    } else if (type === 'fullscreen') {
      fn(true)
    } else if (type === 'openExternal') {
      fn(false) // We're not supporting this
    } else {
      // Bubble the rest out to the user...
      const site = this.getPermissionSiteFromWebContents(wc)
      const guestState = guestStore.getState()
      const permission = guestState.getPermission(site, type)

      if (permission === 'granted') {
        fn(true)
      } else if (permission === 'denied') {
        fn(false)
      } else {
        if (!this[privUnresolvedPermissionRequests].has(wc.id)) {
          const wcId = wc.id
          wc.on('destroyed', () => {
            this[privUnresolvedPermissionRequests].delete(wcId)
            this.emit(
              'unresolved-permission-requests-changed',
              wcId,
              this.getUnresolvedPermissionTypes(wcId)
            )
          })
          wc.on('did-navigate', () => {
            this[privUnresolvedPermissionRequests].delete(wcId)
            this.emit(
              'unresolved-permission-requests-changed',
              wcId,
              this.getUnresolvedPermissionTypes(wcId)
            )
          })
        }
        this[privUnresolvedPermissionRequests].set(wc.id, {
          ...this[privUnresolvedPermissionRequests].get(wc.id),
          [type]: fn
        })
        this.emit(
          'unresolved-permission-requests-changed',
          wc.id,
          this.getUnresolvedPermissionTypes(wc.id)
        )
      }
    }
  }

  /**
  * Handles permissions by just returning false
  * @param wc: the requesting webcontents
  * @param type: the permission type
  * @param fn: the callback on completion
  */
  _handleUnhandledPermissionRequest = (wc, type, fn) => {
    fn(false)
  }
}

export default new PermissionManager()
