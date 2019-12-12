import querystring from 'querystring'
import SlackRTM from './SlackRTM'
import FetchService from 'shared/FetchService'
import userStore from 'stores/user/userStore'
import accountStore from 'stores/account/accountStore'
import { remote, ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WB_WCFETCH_SERVICE_TEXT_CLEANUP } from 'shared/ipcEvents'

const BASE_URL = 'https://slack.com/api/auth.test#sync-channel'

class SlackHTTP {
  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Rejects a call because the service has no authentication info
  * @param info: any information we have
  * @return promise - rejected
  */
  static _rejectWithNoAuth (info) {
    return Promise.reject(new Error('Service missing authentication information'))
  }

  static _fetch (serviceId, url, partitionId, opts) {
    return Promise.race([
      this._fetchRaw(serviceId, url, partitionId, opts),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('timeout'))
        }, 30000)
      })
    ])
  }

  static _fetchRaw (serviceId, url, partitionId, opts) {
    if (userStore.getState().wceSlackHTTPWcThread()) {
      const wcId = accountStore.getState().getWebcontentTabId(serviceId)
      if (wcId) {
        const wc = remote.webContents.fromId(wcId)
        if (wc && !wc.isDestroyed()) {
          let isSlack
          try {
            isSlack = (new window.URL(wc.getURL())).hostname.endsWith('slack.com')
          } catch (ex) {
            isSlack = false
          }
          if (isSlack) {
            return Promise.resolve()
              .then(() => new Promise((resolve, reject) => {
                const channel = uuid.v4()
                let ipcMessageHandler
                let destroyedHandler
                let navigationHandler

                ipcMessageHandler = (evt, args) => {
                  if (args[0] === channel) {
                    wc.removeListener('ipc-message', ipcMessageHandler)
                    wc.removeListener('destroyed', destroyedHandler)
                    wc.removeListener('did-start-navigation', navigationHandler)
                    resolve(args[1])
                  }
                }
                destroyedHandler = () => {
                  wc.removeListener('ipc-message', ipcMessageHandler)
                  wc.removeListener('did-start-navigation', navigationHandler)
                  reject(new Error('inloaderror'))
                }
                navigationHandler = () => {
                  wc.removeListener('ipc-message', ipcMessageHandler)
                  wc.removeListener('destroyed', destroyedHandler)
                  wc.removeListener('did-start-navigation', navigationHandler)
                  reject(new Error('inloaderror'))
                }

                wc.on('ipc-message', ipcMessageHandler)
                wc.on('destroyed', destroyedHandler)
                wc.on('did-start-navigation', navigationHandler)
                wc.send('WB_WCFETCH_SERVICE_TEXT_RUNNER', channel, url, opts)
              }))
              .then(
                (res) => {
                  ipcRenderer.send(WB_WCFETCH_SERVICE_TEXT_CLEANUP, BASE_URL, partitionId)
                  return Promise.resolve({
                    status: res.status,
                    ok: res.ok,
                    text: () => Promise.resolve(res.body),
                    json: () => Promise.resolve(JSON.parse(res.body))
                  })
                },
                (_err) => {
                  return FetchService.wcRequest(BASE_URL, url, partitionId, opts)
                }
              )
          }
        }
      }
      return FetchService.wcRequest(BASE_URL, url, partitionId, opts)
    } else {
      return FetchService.request(url, partitionId, opts)
    }
  }

  /* **************************************************************************/
  // Profile
  /* **************************************************************************/

  /**
  * Tests the auth
  * @param auth: the auth token
  * @return promise
  */
  static testAuth (serviceId, auth, partitionId) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      token: auth,
      '_x_gantry': true
    })

    return Promise.resolve()
      .then(() => this._fetch(serviceId, 'https://slack.com/api/auth.test?' + query, partitionId, { credentials: 'include' }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
  }

  /* **************************************************************************/
  // RTM Start
  /* **************************************************************************/

  /**
  * Starts the RTM sync service
  * @param auth: the auth token
  * @return promise
  */
  static startRTM (serviceId, auth, partitionId) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      token: auth,
      mpim_aware: true,
      '_x_gantry': true
    })
    return Promise.resolve()
      .then(() => this._fetch(serviceId, 'https://slack.com/api/rtm.start?' + query, partitionId, { credentials: 'include' }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => {
        return { response: res, rtm: new SlackRTM(res.url) }
      })
  }

  /* **************************************************************************/
  // Unread
  /* **************************************************************************/

  /**
  * Gets the unread info from the server
  * @param auth: the auth token
  * @param simpleUnreads = true: true to return the simple unread counts
  */
  static fetchUnreadInfo (serviceId, auth, partitionId, simpleUnreads = true) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      token: auth,
      simple_unreads: simpleUnreads,
      mpim_aware: true,
      include_threads: true,
      '_x_gantry': true
    })
    return Promise.resolve()
      .then(() => this._fetch(serviceId, 'https://slack.com/api/users.counts?' + query, partitionId, { credentials: 'include' }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
  }
}

export default SlackHTTP
