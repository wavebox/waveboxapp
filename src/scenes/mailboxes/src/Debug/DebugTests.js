import { ipcRenderer } from 'electron'

class DebugTests {
  /* **************************************************************************/
  // Database
  /* **************************************************************************/

  /**
  * Runs an analyze test on the mailbox databases
  * @param runs=20: the amount of measure tests to run
  */
  analyzeMailboxesDatabase (runs = 20) {
    // Always late require to prevent cyclic references
    const mailboxPersistence = require('stores/mailbox/mailboxPersistence').default

    const sig = '[TEST:MAILBOXES_DB]'
    console.log(`${sig} start`)
    Promise.resolve()
      .then(() => mailboxPersistence.getStats())
      .then((stats) => {
        console.log(`${sig} stats`, JSON.stringify(stats, null, 2))
        return Promise.resolve()
      })
      .then(() => console.log(`${sig} Wavebox may become unresponsive whilst the following test runs...`))
      .then(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
      })
      .then(() => mailboxPersistence.measurePerformance(runs))
      .then((performance) => {
        const info = Object.keys(performance).reduce((acc, k) => {
          const avg = performance[k].reduce((a, b) => a + b, 0) / performance[k].length
          acc[k] = `First: ${performance[k][0]}ms. Avg: ${avg}ms`
          return acc
        }, {})
        console.log(`${sig} performance`, JSON.stringify(info, null, 2))
        return Promise.resolve()
      })
      .then(() => {
        console.log(`${sig} finish`)
      })
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
    const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
    const { mailboxStore } = require('stores/mailbox')
    const { GoogleHTTP } = require('stores/google')

    const sig = '[TEST:GOOGLE_LABELS]'
    console.log(`${sig} start`)
    const mailboxState = mailboxStore.getState()
    const mailboxes = mailboxState.getMailboxesOfType(CoreMailbox.MAILBOX_TYPES.GOOGLE)
    console.log(`${sig} found ${mailboxes.length} Google Mailboxes`)

    mailboxes.reduce((acc, mailbox) => {
      let auth = null
      return acc
        .then(() => GoogleHTTP.generateAuth(mailbox.accessToken, mailbox.refreshToken, mailbox.authExpiryTime))
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
          console.log(`${sig} ${mailbox.displayName} unread messages:\n`, infoStrings.join('\n\n'))
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
    const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
    const { mailboxStore } = require('stores/mailbox')

    const sig = '[TEST:SLACK_LOCALSTORAGE]'
    console.log(`${sig} start`)
    const mailboxState = mailboxStore.getState()
    const mailboxes = mailboxState.getMailboxesOfType(CoreMailbox.MAILBOX_TYPES.SLACK)
    console.log(`${sig} found ${mailboxes.length} Slack Mailboxes`)

    const mailboxElements = mailboxes
      .map((mailbox) => {
        const element = document.querySelector(`webview[partition="persist:${mailbox.partition}"]`)
        if (element) {
          return { element: element, mailbox: mailbox }
        } else {
          return undefined
        }
      })
      .filter((e) => !!e)
    console.log(`${sig} found ${mailboxes.length} Active Slack Mailboxes`)

    mailboxElements.reduce((acc, {element, mailbox}) => {
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
              console.log(`${sig} ${mailbox.displayName} keyLength:${res.keyLength} length:${res.length}`)
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
              console.log(`${sig} ${mailbox.displayName} localStorage temporarily disabled`)
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
    const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
    const { mailboxStore } = require('stores/mailbox')
    const { MicrosoftHTTP } = require('stores/microsoft')

    const sig = '[TEST:MICROSOFT_MESSAGES]'
    console.log(`${sig} start`)
    const mailboxState = mailboxStore.getState()
    const mailboxes = mailboxState.getMailboxesOfType(CoreMailbox.MAILBOX_TYPES.MICROSOFT)
    console.log(`${sig} found ${mailboxes.length} Microsoft Mailboxes`)

    mailboxes.reduce((acc, mailbox) => {
      let auth = null
      return acc
        .then(() => MicrosoftHTTP.refreshAuthToken(mailbox.refreshToken))
        .then((fetchedAuth) => {
          auth = fetchedAuth.access_token
          return Promise.resolve()
        })
        .then(() => MicrosoftHTTP.fetchUnreadMessages(auth))
        .then((response) => {
          console.log(`${sig} ${mailbox.displayName} unread count:${response.value.length}`)
          console.log(`${sig} ${mailbox.displayName} unread messages:\n`, response.value.map((m) => m.subject + ':' + m.bodyPreview + ':' + m.receivedDateTime).join('\n'))
          return Promise.resolve()
        })
    }, Promise.resolve())
  }

  /**
  * Authenticates a new microsoft account and marks all unread emails in the inbox read
  * @param accessMode: the access mode of whether this is outlook or office 365
  */
  markAllMicrosoftInboxEmailsRead (accessMode) {
    // Always late require to prevent cyclic references
    const MicrosoftMailbox = require('shared/Models/Accounts/Microsoft/MicrosoftMailbox')
    const { mailboxStore, mailboxActions, MicrosoftMailboxReducer } = require('stores/mailbox')
    const { MicrosoftHTTP } = require('stores/microsoft')
    const uuid = require('uuid')
    const { WB_AUTH_MICROSOFT_COMPLETE, WB_AUTH_MICROSOFT_ERROR } = require('shared/ipcEvents')

    const sig = '[TEST:MICROSOFT_MARK_INBOX_READ]'
    const mailboxId = `debug_${uuid.v4()}`
    const provisionalMailboxJS = { id: mailboxId }

    // Validate
    let authAction
    if (accessMode === MicrosoftMailbox.ACCESS_MODES.OUTLOOK) {
      authAction = mailboxActions.authenticateOutlookMailbox
    } else if (accessMode === MicrosoftMailbox.ACCESS_MODES.OFFICE365) {
      authAction = mailboxActions.authenticateOffice365Mailbox
    } else {
      console.log(`${sig} accessMode of "${accessMode}" is not valid`)
      return
    }

    // Create some util methods
    const refreshHTTPToken = (mailbox) => {
      if (mailbox.authExpiryTime > new Date().getTime()) {
        return Promise.resolve(mailbox.accessToken)
      } else {
        return Promise.resolve()
          .then(() => MicrosoftHTTP.refreshAuthToken(mailbox.refreshToken, mailbox.authProtocolVersion))
          .then((auth) => {
            mailboxActions.reduce.defer(mailbox.id, MicrosoftMailboxReducer.setAuthInfo, auth)
            return Promise.resolve(auth.access_token)
          })
      }
    }

    // Create auth listeners
    const authSuccessHandler = (evt, data) => {
      if (data.id !== mailboxId) { return }
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_COMPLETE, authSuccessHandler)
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_ERROR, authSuccessHandler)
      console.log(`${sig} authentication success`)
      setTimeout(() => { // Wait for the store to create the model
        console.log(`${sig} ...pause end`)
        const mailbox = mailboxStore.getState().getMailbox(mailboxId)
        let accessToken
        Promise.resolve()
          .then(() => refreshHTTPToken(mailbox))
          .then((latestAccessToken) => {
            accessToken = latestAccessToken
            return Promise.resolve()
          })
          .then(() => MicrosoftHTTP.fetchInboxUnreadCountAndUnreadMessages(accessToken, 10))
          .then(({ unreadCount, messages }) => {
            console.log(`${sig} found ${unreadCount} unread messages`, messages)

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
            console.log(`${sig} removing debug mailbox`)
            mailboxActions.remove(mailboxId)
            console.log(`${sig} Done!`)
          })
      }, 1000)
    }
    const authFailureHandler = (evt, data) => {
      if (data.id !== mailboxId) { return }
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_COMPLETE, authSuccessHandler)
      ipcRenderer.removeListener(WB_AUTH_MICROSOFT_ERROR, authSuccessHandler)
      console.log(`${sig} authentication failed`, data)
    }

    console.log(`${sig} use the authentication window to login to your account...`)
    ipcRenderer.on(WB_AUTH_MICROSOFT_COMPLETE, authSuccessHandler)
    ipcRenderer.on(WB_AUTH_MICROSOFT_ERROR, authFailureHandler)
    authAction(provisionalMailboxJS, ['Mail.ReadWrite'])
  }
}

export default DebugTests
