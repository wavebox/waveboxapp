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
    const mailboxPersistence = require('stores/mailbox/mailboxPersistence')

    const sig = '[TEST:MAILBOXES_DB]'
    console.log(`${sig} start`)
    Promise.resolve()
      .then(() => mailboxPersistence.getStats())
      .then((stats) => {
        console.log(`${sig} stats`, JSON.stringify(stats, null, 2))
        return Promise.resolve()
      })
      .then(() => console.log(`${sig} Wavebox may become unresponsive whilst the following test runs...`))
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
  * Clears localStorage and disables localStorage for any open slack clients
  */
  clearAndDisableLocalStorage () {
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
}

export default DebugTests
