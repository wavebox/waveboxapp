import { session, app } from 'electron'
import WebRequestEmitter from './WebRequestEmitter'
import fs from 'fs-extra'
import path from 'path'

class SessionManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this._setup = false
    this._sessions = []
    this._webRequestEmitter = new Map()
  }

  start () {
    if (this._setup) { return }
    this._setup = true

    app.on('session-created', this._handleSessionCreated)
  }

  /* ****************************************************************************/
  // Session listeners
  /* ****************************************************************************/

  /**
  * Handles the session being created
  */
  _handleSessionCreated = (ses) => {
    this._sessions.push(ses)
  }

  /* ****************************************************************************/
  // Session
  /* ****************************************************************************/

  /**
  * Pass through for session
  * @param id: the session id
  * @param opts=undefined: the options
  * @return the session
  */
  fromPartition (id, opts = undefined) {
    return session.fromPartition(id, opts)
  }

  /**
  * @return a list of all sessions
  */
  getAllSessions () { return Array.from(this._sessions) }

  /**
  * @return the default session
  */
  getDefaultSession () { return session.defaultSession }

  /**
  * Gets the session ids from disk
  * @return a list of session ids from disk
  */
  getAllDiskSessionIdsSync () {
    const dirPath = path.join(app.getPath('userData'), 'Partitions')
    try {
      return fs
        .readdirSync(dirPath)
        .filter((id) => !id.startsWith('.'))
        .map((id) => `persist:${decodeURIComponent(id)}`)
    } catch (ex) {
      return []
    }
  }

  /* ****************************************************************************/
  // Session Tools
  /* ****************************************************************************/

  /**
  * Clears a session completely - including from disk
  * @param id: the session id
  * @return promise
  */
  clearSessionFull (id) {
    return new Promise((resolve, reject) => {
      const ses = session.fromPartition(id)

      this.destroyWebRequestEmitterFromSession(ses)

      ses.clearCache(() => {
        ses.clearStorageData(() => {
          ses.clearHostResolverCache(() => {
            if (id.startsWith('persist:')) {
              setTimeout(() => {
                const pureSessionId = encodeURIComponent(id.replace('persist:', ''))
                const dirPath = path.join(app.getPath('userData'), 'Partitions', pureSessionId)
                fs.remove(dirPath, () => {
                  resolve()
                })
              }, 100)
            } else {
              resolve()
            }
          })
        })
      })
    })
  }

  /* ****************************************************************************/
  // WebRequest
  /* ****************************************************************************/

  /**
  * Looks to see if there is a web request emitter for a session
  * @param ses: the session
  * @return true if there is an emitter, false otherwise
  */
  hasWebRequestEmitterForSession (ses) {
    return this._webRequestEmitter.has(ses)
  }

  /**
  * @param ses: the session
  * @return a webRequestEmitter for the session
  */
  webRequestEmitterFromSession (ses) {
    if (!this._webRequestEmitter.has(ses)) {
      this._webRequestEmitter.set(ses, new WebRequestEmitter(ses.webRequest))
    }
    return this._webRequestEmitter.get(ses)
  }

  /**
  * Destroys a webrequest emitter for a session
  * @param ses: the session
  */
  destroyWebRequestEmitterFromSession (ses) {
    const emitter = this._webRequestEmitter.get(ses)
    if (emitter) {
      emitter.unbind()
      this._webRequestEmitter.delete(ses)
    }
  }

  /**
  * @param partitionId: the id of a partition
  * @return a webRequestEmitter for the session
  */
  webRequestEmitterFromPartitionId (partitionId) {
    return this.webRequestEmitterFromSession(session.fromPartition(partitionId))
  }
}

export default new SessionManager()
