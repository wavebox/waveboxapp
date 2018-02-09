import { ipcMain } from 'electron'
import { WB_AUTH_WAVEBOX, WB_AUTH_WAVEBOX_COMPLETE, WB_AUTH_WAVEBOX_ERROR } from 'shared/ipcEvents'
import { userStore } from 'stores/user'
import querystring from 'querystring'
import url from 'url'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AuthWindow from 'Windows/AuthWindow'

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
      case CoreMailbox.MAILBOX_TYPES.GOOGLE: authUrl = 'https://waveboxio.com/auth/accountgoogle'; break
      case CoreMailbox.MAILBOX_TYPES.MICROSOFT: authUrl = 'https://waveboxio.com/auth/accountmicrosoft'; break
    }
    if (authUrl) {
      const args = querystring.stringify(Object.assign({}, serverArgs, {
        client_id: userStore.getState().clientId,
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

      const waveboxOauthWin = new AuthWindow()
      waveboxOauthWin.create(authUrl, {
        useContentSize: true,
        center: true,
        show: false,
        resizable: false,
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
      const oauthWin = waveboxOauthWin.window
      let userClose = true

      oauthWin.on('closed', () => {
        if (userClose) {
          reject(new Error('User closed the window'))
        }
      })

      oauthWin.webContents.on('did-get-redirect-request', (evt, prevUrl, nextUrl) => {
        if (nextUrl.startsWith('https://wavebox.io/account/register/completed') || nextUrl.startsWith('https://waveboxio.com/account/register/completed')) {
          const purl = url.parse(nextUrl, true)
          userClose = false
          oauthWin.close()
          resolve({ next: purl.query.next })
        } else if (nextUrl.startsWith('https://wavebox.io/account/register/failure') || nextUrl.startsWith('https://waveboxio.com/account/register/failure')) {
          const purl = url.parse(nextUrl, true)
          userClose = false
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

export default AuthWavebox
