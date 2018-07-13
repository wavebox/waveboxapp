class DebugTests {
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
        .then(({threads = []}) => {
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

    serviceElements.reduce((acc, {element, service}) => {
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
    const MicrosoftHTTP = require('stores/microsoft/MicrosoftHTTP').defaut
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
}

export default DebugTests
