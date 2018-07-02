import { ipcMain } from 'electron'
import { WB_AUTH_WAVEBOX, WB_AUTH_WAVEBOX_COMPLETE, WB_AUTH_WAVEBOX_ERROR } from 'shared/ipcEvents'
import { userStore } from 'stores/user'
import querystring from 'querystring'
import { URL } from 'url'
import WaveboxAuthProviders from 'shared/Models/WaveboxAuthProviders'
import AuthWindow from 'Windows/AuthWindow'
import { SessionManager } from 'SessionManager'

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
      case WaveboxAuthProviders.GOOGLE: authUrl = 'https://waveboxio.com/auth/accountgoogle'; break
      case WaveboxAuthProviders.MICROSOFT: authUrl = 'https://waveboxio.com/auth/accountmicrosoft'; break
      case WaveboxAuthProviders.WAVEBOX: authUrl = 'https://waveboxio.com/auth/wavebox'; break
    }
    if (authUrl) {
      const args = querystring.stringify({
        ...serverArgs,
        client_id: userStore.getState().clientId,
        client_secret: clientSecret
      })
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
  * @param partitionId = null: the id of the partition to use if any
  * @return promise
  */
  promptUserToAuthorizeWavebox (clientSecret, type, serverArgs, partitionId = null) {
    partitionId = partitionId || `rand_${new Date().getTime()}`
    return new Promise((resolve, reject) => {
      const authUrl = this.generateAuthenticationURL(clientSecret, type, serverArgs)
      if (!authUrl) {
        reject(new Error('Invalid Auth URL'))
        return
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
          sandbox: true,
          nativeWindowOpen: true,
          sharedSiteInstances: true,
          partition: partitionId
        }
      })
      const oauthWin = waveboxOauthWin.window
      const emitter = SessionManager.webRequestEmitterFromPartitionId(partitionId)
      let userClose = true

      // Handle Redirects
      const handleHeadersReceived = (details, responder) => {
        if (details.webContentsId !== oauthWin.webContents.id) { return responder({}) }

        if (details.statusCode === 302) {
          let nextUrlParsed
          let nextUrl
          try {
            nextUrlParsed = new URL(
              details.responseHeaders.location || details.responseHeaders.Location,
              details.url
            )
            nextUrl = nextUrlParsed.toString()
          } catch (ex) {
            return responder({})
          }

          if (nextUrl.startsWith('https://wavebox.io/account/register/completed') || nextUrl.startsWith('https://waveboxio.com/account/register/completed')) {
            userClose = false
            oauthWin.close()
            responder({ cancel: true })
            resolve({ next: nextUrlParsed.searchParams.get('next') })
            return
          } else if (nextUrl.startsWith('https://wavebox.io/account/register/failure') || nextUrl.startsWith('https://waveboxio.com/account/register/failure')) {
            userClose = false
            oauthWin.close()
            responder({ cancel: true })
            reject(new Error(nextUrlParsed.searchParams.get('error') || 'Registration failure'))
            return
          }
        }

        responder({})
      }
      emitter.headersReceived.onBlocking(undefined, handleHeadersReceived)

      // Handle dom Ready
      oauthWin.webContents.on('dom-ready', () => {
        if (!oauthWin.isVisible()) {
          oauthWin.show()
        }
      })

      // Handle close
      oauthWin.on('closed', () => {
        emitter.headersReceived.removeListener(handleHeadersReceived)
        if (userClose) {
          reject(new Error('User closed the window'))
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
      .then(() => this.promptUserToAuthorizeWavebox(body.clientSecret, body.type, body.serverArgs, body.partitionId))
      .then(({ next }) => {
        evt.sender.send(WB_AUTH_WAVEBOX_COMPLETE, {
          type: body.type,
          openAccountOnSuccess: body.openAccountOnSuccess,
          next: next
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_WAVEBOX_ERROR, {
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
