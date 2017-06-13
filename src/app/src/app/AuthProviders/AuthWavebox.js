const { ipcMain, BrowserWindow } = require('electron')
const { WB_AUTH_WAVEBOX, WB_AUTH_WAVEBOX_COMPLETE, WB_AUTH_WAVEBOX_ERROR } = require('../../shared/ipcEvents')
const userStore = require('../stores/userStore')
const querystring = require('querystring')
const url = require('url')
const CoreMailbox = require('../../shared/Models/Accounts/CoreMailbox')

class AuthWavebox {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_AUTH_WAVEBOX, (evt, body) => {
      this.handleAuthWavebox(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Generates the authentication url to use
  * @param clientSecret: the secret that authorises the requests
  * @param type: the type of account we're authorizing
  * @param serverArgs: extra args to send to the server
  * @return the url
  */
  generateAuthenticationURL (clientSecret, type, serverArgs) {
    let authUrl
    switch (type) {
      case CoreMailbox.MAILBOX_TYPES.GOOGLE: authUrl = 'https://wavebox.io/auth/accountgoogle'; break
      case CoreMailbox.MAILBOX_TYPES.MICROSOFT: authUrl = 'https://wavebox.io/auth/accountmicrosoft'; break
    }
    if (authUrl) {
      const args = querystring.stringify(Object.assign({}, serverArgs, {
        client_id: userStore.clientId,
        client_secret: clientSecret
      }))
      return `${authUrl}?${args}`
    } else {
      return undefined
    }
  }

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param clientSecret: the secret that authorises the requests
  * @param type: the type of provider we're using to authorize
  * @param serverArgs: extra args to send to the server
  * @param mailboxId = null: the id of the mailbox to use if any
  * @return promise
  */
  promptUserToAuthorizeWavebox (clientSecret, type, serverArgs, mailboxId = null) {
    return new Promise((resolve, reject) => {
      const authUrl = this.generateAuthenticationURL(clientSecret, type, serverArgs)
      if (!authUrl) {
        reject(new Error('Invalid Auth URL'))
        return
      }

      let partitionId
      if (mailboxId) {
        partitionId = mailboxId.indexOf('persist:') === 0 ? mailboxId : 'persist:' + mailboxId
      } else {
        partitionId = `rand_${new Date().getTime()}`
      }

      const oauthWin = new BrowserWindow({
        useContentSize: true,
        center: true,
        show: false,
        resizable: false,
        alwaysOnTop: true,
        standardWindow: true,
        autoHideMenuBar: true,
        title: 'Wavebox',
        height: 750,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: partitionId
        }
      })
      oauthWin.loadURL(authUrl)

      oauthWin.on('closed', () => {
        reject(new Error('User closed the window'))
      })

      oauthWin.webContents.on('did-get-redirect-request', (evt, prevUrl, nextUrl) => {
        if (nextUrl.indexOf('https://wavebox.io/account/register/completed') === 0) {
          const purl = url.parse(nextUrl, true)
          oauthWin.removeAllListeners('closed')
          oauthWin.close()
          resolve({ next: purl.query.next })
        } else if (nextUrl.indexOf('https://wavebox.io/account/register/failure') === 0) {
          const purl = url.parse(nextUrl, true)
          oauthWin.removeAllListeners('closed')
          oauthWin.close()
          reject(new Error(purl.query.error || 'Registration failure'))
        }
      })
      oauthWin.webContents.on('dom-ready', () => {
        if (!oauthWin.isVisible()) {
          oauthWin.show()
        }
      })
    })
  }

  /* ****************************************************************************/
  // Request Handlers
  /* ****************************************************************************/

  /**
  * Handles the oauth request
  * @param evt: the incoming event
  * @param body: the body sent to us
  */
  handleAuthWavebox (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToAuthorizeWavebox(body.clientSecret, body.type, body.serverArgs, body.id))
      .then(({ next }) => {
        evt.sender.send(WB_AUTH_WAVEBOX_COMPLETE, {
          id: body.id,
          type: body.type,
          next: next
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_WAVEBOX_ERROR, {
          id: body.id,
          type: body.type,
          error: err,
          errorString: (err || {}).toString ? (err || {}).toString() : undefined,
          errorMessage: (err || {}).message ? (err || {}).message : undefined,
          errorStack: (err || {}).stack ? (err || {}).stack : undefined
        })
      })
  }
}

module.exports = AuthWavebox
