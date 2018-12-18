import DebugSlackCount from './DebugSlackCount'

class DebugTests {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.debugSlackCount = new DebugSlackCount()
  }

  /* **************************************************************************/
  // Google Sync
  /* **************************************************************************/

  /**
  * Fetches a set of unread messages so they can be compared against the ones that
  * are being searched for
  */
  fetchGoogleUnreadMessageLabels () {
    // Always late require to prevent cyclic references
    const accountStore = require('stores/account/accountStore').default
    const GoogleHTTP = require('stores/google/GoogleHTTP').default
    const SERVICE_TYPES = require('shared/Models/ACAccounts/ServiceTypes').default

    const sig = '[TEST:GOOGLE_LABELS]'
    console.log(`${sig} start`)
    const accountState = accountStore.getState()
    const services = [].concat(
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_INBOX),
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL)
    )
    console.log(`${sig} found ${services.length} Google Mailboxes`)

    services.reduce((acc, service) => {
      const serviceAuth = accountState.getMailboxAuthForServiceId(service.id)
      let auth = null
      return acc
        .then(() => GoogleHTTP.generateAuth(serviceAuth.accessToken, serviceAuth.refreshToken, serviceAuth.authExpiryTime))
        .then((fetchedAuth) => {
          auth = fetchedAuth
          return Promise.resolve()
        })
        .then(() => GoogleHTTP.fetchGmailThreadHeadersList(auth, 'label:inbox label:unread', undefined, 100))
        .then(({ threads = [] }) => {
          return GoogleHTTP.fullyResolveGmailThreadHeaders(auth, {}, threads, (t) => t)
        })
        .then((threads) => {
          const info = threads.map((thread) => {
            const labels = thread.messages.reduce((acc, message) => {
              message.labelIds.forEach((labelId) => {
                acc.add(labelId)
              })
              return acc
            }, new Set())
            return {
              labels: Array.from(labels),
              snippet: thread.messages[thread.messages.length - 1].snippet
            }
          })
          const infoStrings = info.map((i) => i.labels.join(',') + ': ' + i.snippet)
          console.log(`${sig} ${service.displayName} unread messages:\n`, infoStrings.join('\n\n'))
        })
    }, Promise.resolve())
  }

  /* **************************************************************************/
  // Slack
  /* **************************************************************************/

  /**
  * Clears localStorage for slack mailboxes and disables localStorage for them
  * Only works whilst webview is in window. Sleep-cycle restores localStorage
  * functionality
  */
  clearAndDisableSlackLocalStorage () {
    // Always late require to prevent cyclic references
    const accountStore = require('stores/account/accountStore').default
    const SERVICE_TYPES = require('shared/Models/ACAccounts/ServiceTypes').default

    const sig = '[TEST:SLACK_LOCALSTORAGE]'
    console.log(`${sig} start`)
    const accountState = accountStore.getState()
    const services = accountState.allServicesOfType(SERVICE_TYPES.SLACK)
    console.log(`${sig} found ${services.length} Slack Mailboxes`)

    const serviceElements = services
      .map((service) => {
        const element = document.querySelector(`webview[partition="${service.partitionId}"]`)
        if (element) {
          return { element: element, service: service }
        } else {
          return undefined
        }
      })
      .filter((e) => !!e)
    console.log(`${sig} found ${services.length} Active Slack Mailboxes`)

    serviceElements.reduce((acc, { element, service }) => {
      return acc
        .then(() => {
          return new Promise((resolve, reject) => {
            element.executeJavaScript(`
              (function () {
                if (window.localStorage) {
                  let length = 0
                  let keyLength = 0
                  for (let k in window.localStorage) {
                    keyLength++
                    length += window.localStorage[k].length
                  }
                  return { keyLength: keyLength, length: length }
                } else {
                  return { keyLength: 0, length: 0 }
                }
              })()
            `, false, (res) => {
              console.log(`${sig} ${service.displayName} keyLength:${res.keyLength} length:${res.length}`)
              resolve()
            })
          })
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            element.executeJavaScript(`
              (function () {
                if (window.localStorage) {
                  window.localStorage.clear()
                  delete window.localStorage
                }
                return true
              })()
            `, false, (res) => {
              console.log(`${sig} ${service.displayName} localStorage temporarily disabled`)
              resolve()
            })
          })
        })
    }, Promise.resolve())
  }

  /* **************************************************************************/
  // Microsoft
  /* **************************************************************************/

  /**
  * Fetches a set of unread messages so they can be compared against the ones that
  * are being searched for
  */
  fetchMicrosoftUnreadMessageList () {
    // Always late require to prevent cyclic references
    const accountStore = require('stores/account/accountStore').default
    const MicrosoftHTTP = require('stores/microsoft/MicrosoftHTTP').default
    const SERVICE_TYPES = require('shared/Models/ACAccounts/ServiceTypes').default

    const sig = '[TEST:MICROSOFT_MESSAGES]'
    console.log(`${sig} start`)
    const accountState = accountStore.getState()
    const services = accountState.allServicesOfType(SERVICE_TYPES.MICROSOFT_MAIL)
    console.log(`${sig} found ${services.length} Microsoft Mailboxes`)

    services.reduce((acc, service) => {
      const serviceAuth = accountState.getMailboxAuthForServiceId(service.id)
      let auth = null
      return acc
        .then(() => MicrosoftHTTP.refreshAuthToken(serviceAuth.refreshToken))
        .then((fetchedAuth) => {
          auth = fetchedAuth.access_token
          return Promise.resolve()
        })
        .then(() => MicrosoftHTTP.fetchUnreadMessages(auth))
        .then((response) => {
          console.log(`${sig} ${service.displayName} unread count:${response.length}`)
          console.log(`${sig} ${service.displayName} unread messages:\n`, response.map((m) => m.subject + ':' + m.bodyPreview + ':' + m.receivedDateTime).join('\n'))
          return Promise.resolve()
        })
    }, Promise.resolve())
  }

  /* **************************************************************************/
  // Misc
  /* **************************************************************************/

  /**
  * Runs a flash test of all components
  */
  flashTest () {
    // Always late require to prevent cyclic references
    const accountStore = require('stores/account/accountStore').default
    const crextensionStore = require('stores/crextension/crextensionStore').default
    const crextensionActions = require('stores/crextension/crextensionActions').default
    const { ipcRenderer, remote } = require('electron')
    const pkg = require('package.json')
    const {
      WB_SHOW_TRAY_WINDOWED,
      WB_METRICS_OPEN_MONITOR,
      WB_NEW_WINDOW,
      WB_KEYCHAIN_OPEN
    } = require('shared/ipcEvents')

    const sig = '[TEST:FLASH_TEST]'

    const accountState = accountStore.getState()
    const service = accountState.getService(accountState.firstServiceId())
    const webview = document.querySelector('webview')

    // System windows
    console.log(`${sig} Tray`)
    ipcRenderer.send(WB_SHOW_TRAY_WINDOWED)
    console.log(`${sig} Tray:opened`)

    console.log(`${sig} Monitor`)
    ipcRenderer.send(WB_METRICS_OPEN_MONITOR)
    console.log(`${sig} Monitor:opened`)

    console.log(`${sig} Keychain`)
    ipcRenderer.send(WB_KEYCHAIN_OPEN, 'https://wavebox.io')
    console.log(`${sig} Keychain:opened`)

    // Content window
    console.log(`${sig} Content Window`)
    if (service) {
      ipcRenderer.send(WB_NEW_WINDOW, {
        serviceId: service.id,
        url: window.atob('aHR0cHM6Ly93YXZlYm94Lmlv'),
        partition: service.partitionId,
        webPreferences: { partition: service.partitionId }
      })
      console.log(`${sig} Content Window:opened`)
    } else {
      console.warn(`${sig} Content Window:FAILED. Needs service`)
    }

    // Content PDF
    console.log(`${sig} PDF Print`)
    if (service) {
      ipcRenderer.send(WB_NEW_WINDOW, {
        serviceId: service.id,
        url: window.atob('aHR0cHM6Ly93d3cudzMub3JnL1dBSS9FUi90ZXN0cy94aHRtbC90ZXN0ZmlsZXMvcmVzb3VyY2VzL3BkZi9kdW1teS5wZGY/cHJpbnQ9dHJ1ZQ=='),
        partition: service.partitionId,
        webPreferences: { partition: service.partitionId }
      })
      console.log(`${sig} PDF Print:opened`)
    } else {
      console.warn(`${sig} PDF Print:FAILED. Needs service`)
    }

    // Extensions
    const extensionId = crextensionStore.getState().extensionIds()[0]
    console.log(`${sig} Extension Background`)
    if (extensionId) {
      crextensionActions.inspectBackgroundPage(extensionId)
      console.log(`${sig} Extension Background:opened`)
    } else {
      console.warn(`${sig} Extension Background:FAILED. Needs extension`)
    }

    // Dev tools
    console.log(`${sig} Tab DevTools`)
    if (webview) {
      webview.getWebContents().openDevTools()
      console.log(`${sig} Tab DevTools:opened`)
    } else {
      console.warn(`${sig} Tab DevTools:FAILED. Needs webview`)
    }

    // Stats
    console.log([
      `App: ${pkg.name}`,
      `Version: ${pkg.version}`,
      `Channel: ${pkg.releaseChannel}`,
      `WBShell: ${process.versions.wb_shell}`,
      `Electron: ${process.versions.electron}`,
      `Chrome: ${process.versions.chrome}`,
      `Navigator: ${window.navigator.userAgent}`
    ].join('\n'))

    setTimeout(() => {
      remote.getCurrentWindow().focus()
    }, 1500)
  }

  /**
  * Opens all openable dev tools
  */
  allDevTools () {
    // Always late require to prevent cyclic references
    const { remote } = require('electron')
    remote.webContents.getAllWebContents().forEach((wc) => {
      wc.openDevTools()
    })
  }
}

export default DebugTests
