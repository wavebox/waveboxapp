import DebugSlackCount from './DebugSlackCount'

class DebugTests {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.debugSlackCount = new DebugSlackCount()
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

  /**
  * Authenticates a new microsoft account and marks all unread emails in the inbox read
  */
  markAllMicrosoftInboxEmailsRead (userIndex = undefined) {
    const accountStore = require('stores/account/accountStore').default
    const accountActions = require('stores/account/accountActions').default
    const { ipcRenderer } = require('electron')
    const SERVICE_TYPES = require('shared/Models/ACAccounts/ServiceTypes').default
    const Bootstrap = require('R/Bootstrap').default
    const CoreACAuth = require('shared/Models/ACAccounts/CoreACAuth').default
    const MicrosoftHTTP = require('stores/microsoft/MicrosoftHTTP').default
    const MicrosoftMailService = require('shared/Models/ACAccounts/Microsoft/MicrosoftMailService').default
    const { WB_AUTH_MICROSOFT, WB_AUTH_MICROSOFT_COMPLETE, WB_AUTH_MICROSOFT_ERROR } = require('shared/ipcEvents')
    const sig = '[TEST:MICROSOFT_MARK_READ]'

    const accountState = accountStore.getState()
    const allServices = accountState.allServicesOfType(SERVICE_TYPES.MICROSOFT_MAIL).sort((a, b) => {
      if (a.id < b.id) { return -1 }
      if (a.id > b.id) { return 1 }
      return 0
    })

    // Get the service from the user
    let service
    if (allServices.length === 0) {
      throw new Error('No Microsoft services found. Failed to start')
    } else if (allServices.length === 1) {
      service = allServices[0]
    } else if (userIndex === undefined) {
      console.log([
        `${sig} Multiple Microsoft services found. Run "markAllMicrosoftInboxEmailsRead(index)" with the index of the service you want to use`
      ].concat(allServices.map((service, index) => {
        return `${index}: ${service.serviceDisplayName}`
      })).join('\n'))
    } else {
      service = allServices[userIndex]
    }
    if (!service) {
      throw new Error('Microsoft service not found. Failed to start')
    }
    console.log(`${sig} Starting for service ${service.id} ${service.serviceDisplayName}`)
    const serviceId = service.id

    // Create auth listeners
    const authSuccessHandler = (evt, data) => {
      if (data.context.mailboxId !== service.parentId) { return }
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_COMPLETE, authSuccessHandler)
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_ERROR, authSuccessHandler)

      console.log(`${sig} Authentication success. Marking read`)
      setTimeout(() => { // Wait for the store to create the model
        const accountState = accountStore.getState()
        const service = accountState.getService(serviceId)
        const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)

        let accessToken
        Promise.resolve()
          .then(() => {
            return Promise.resolve()
              .then(() => MicrosoftHTTP.refreshAuthToken(serviceAuth.refreshToken, serviceAuth.authProtocolVersion))
              .then((res) => {
                accessToken = res.access_token
                return Promise.resolve(res.access_token)
              })
          })
          .then((accessToken) => {
            switch (service.unreadMode) {
              case MicrosoftMailService.UNREAD_MODES.INBOX_FOCUSED_UNREAD:
                return MicrosoftHTTP.fetchFocusedUnreadCountAndUnreadMessages(accessToken, 50)
              case MicrosoftMailService.UNREAD_MODES.INBOX_UNREAD:
              default:
                return MicrosoftHTTP.fetchInboxUnreadCountAndUnreadMessages(accessToken, 50)
            }
          })
          .then(({ unreadCount, messages }) => {
            console.log(`${sig} Found ${unreadCount} unread messages`, messages)

            return messages.reduce((acc, message) => {
              return acc
                .then(() => {
                  console.log(`${sig} marking message read ${message.from.emailAddress.address}:${message.subject}`)
                  return MicrosoftHTTP.markMessageRead(accessToken, message.id)
                })
                .then((data) => {
                  console.log(`${sig} Success (${message.from.emailAddress.address}:${message.subject})`, data)
                })
                .catch((err) => {
                  console.log(`${sig} Failed (${message.from.emailAddress.address}:${message.subject})`, err)
                  return Promise.resolve()
                })
            }, Promise.resolve())
          })
          .then(() => {
            accountActions.fullSyncService(serviceId)
          })
          .catch((err) => {
            console.error(`${sig}`, err)
            throw new Error('Unexpected Error', err)
          })
      }, 1000)
    }
    const authFailureHandler = (evt, data) => {
      if (data.context.mailboxId !== service.parentId) { return }
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_COMPLETE, authSuccessHandler)
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_ERROR, authSuccessHandler)
      console.log(`${sig} Authentication failed`, data)
    }

    // Fire the auth call
    console.log(`${sig} Use the authentication window to login to your account...`)
    ipcRenderer.on(WB_AUTH_MICROSOFT_COMPLETE, authSuccessHandler)
    ipcRenderer.on(WB_AUTH_MICROSOFT_ERROR, authFailureHandler)
    ipcRenderer.send(WB_AUTH_MICROSOFT, {
      partitionId: service.partitionId,
      credentials: Bootstrap.credentials,
      mode: 'REAUTHENTICATE',
      additionalPermissions: ['Mail.ReadWrite'],
      context: {
        mailboxId: service.parentId,
        authId: CoreACAuth.compositeIdFromService(service),
        serviceId: service.id,
        sandboxedPartitionId: service.sandboxFromMailbox
          ? service.partitionId
          : undefined
      }
    })
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
    const { ipcRenderer, remote, webFrame } = require('electron')
    const pkg = require('package.json')
    const {
      WB_SHOW_TRAY_WINDOWED,
      WB_METRICS_OPEN_MONITOR,
      WB_NEW_WINDOW,
      WB_NEW_POPUP_WINDOW,
      WB_KEYCHAIN_OPEN
    } = require('shared/ipcEvents')
    const {
      CRX_RUNTIME_CONTENTSCRIPT_BENCHMARK_CONFIG_SYNC
    } = require('shared/crExtensionIpcEvents')

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

    // Content popup window
    console.log(`${sig} Content Popup Window`)
    if (service) {
      ipcRenderer.send(WB_NEW_POPUP_WINDOW, {
        serviceId: service.id,
        url: window.atob('aHR0cHM6Ly93YXZlYm94Lmlv'),
        partition: service.partitionId,
        webPreferences: { partition: service.partitionId }
      })
      console.log(`${sig} Content Popup Window:opened`)
    } else {
      console.warn(`${sig} Content Popup Window:FAILED. Needs service`)
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
    const extensionBenchmarkConfig = ipcRenderer.sendSync(CRX_RUNTIME_CONTENTSCRIPT_BENCHMARK_CONFIG_SYNC)
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

    // Apis
    if (remote.app.setTrayType === undefined) {
      console.warn(`${sig} app.setTrayType unavailable`)
    }
    if (webFrame.createContextId === undefined) {
      console.warn(`${sig} webFrame.createContextId unavailable`)
    }
    if (remote.TextField === undefined) {
      console.warn(`${sig} nativeUI unavailable`)
    }

    // Stats
    console.log([
      `App: ${pkg.name}`,
      `Version: ${pkg.version}`,
      `Channel: ${pkg.releaseChannel}`,
      `WBShell: ${process.versions.wb_shell}`,
      `WBExt Benchmark: J${JSON.stringify(extensionBenchmarkConfig)}`,
      `Electron: ${process.versions.electron}`,
      `Chrome: ${process.versions.chrome}`,
      `Navigator: ${window.navigator.userAgent}`
    ].join('\n'))

    setTimeout(() => {
      remote.getCurrentWindow().focus()
    }, 1500)
  }

  /**
  * Adds a number of accounts
  * @param count=1: the number of accounts to add
  * @param sleepable=true: whether to set sleepable on the acconts
  */
  addAccounts (count = 1, sleepable = true) {
    const accountActions = require('stores/account/accountActions').default
    const uuid = require('uuid')
    const ACMailbox = require('shared/Models/ACAccounts/ACMailbox').default
    const CoreACService = require('shared/Models/ACAccounts/CoreACService').default
    const SERVICE_TYPES = require('shared/Models/ACAccounts/ServiceTypes').default
    const URLS = [
      'https://wavebox.io',
      'https://wavebox.io/download',
      'https://wavebox.io/kb',
      'https://wavebox.io/why-wavebox',
      'https://github.com/wavebox',
      'https://github.com/wavebox/waveboxapp'
    ]

    for (let i = 0; i < count; i++) {
      const mailboxId = uuid.v4()
      accountActions.createMailbox.defer(ACMailbox.createJS(
        mailboxId,
        'test',
        '#FF0000',
        'test_template'
      ))
      const service = {
        ...CoreACService.createJS(undefined, mailboxId, SERVICE_TYPES.GENERIC),
        url: URLS[i % URLS.length],
        sleepable: sleepable
      }
      accountActions.createService.defer(mailboxId, ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START, service)
    }
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
