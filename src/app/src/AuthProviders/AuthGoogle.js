import { ipcMain } from 'electron'
import { WB_AUTH_GOOGLE, WB_AUTH_GOOGLE_COMPLETE, WB_AUTH_GOOGLE_ERROR } from 'shared/ipcEvents'
import { userStore } from 'stores/user'
import { URL } from 'url'
import querystring from 'querystring'
import pkg from 'package.json'
import AuthWindow from 'Windows/AuthWindow'
import { SessionManager } from 'SessionManager'
import Resolver from 'Runtime/Resolver'

class AuthGoogle {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_AUTH_GOOGLE, (evt, body) => {
      this.handleAuthGoogle(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param credentials: the credentials to use
  * @param partitionId: the id of the partition
  * @return promise
  */
  promptUserToAuthenticate (credentials, partitionId) {
    return new Promise((resolve, reject) => {
      const userState = userStore.getState()
      const queryQS = querystring.stringify({
        client_id: userState.clientId,
        client_token: userState.clientToken,
        client_version: pkg.version
      })
      const authUrl = `${credentials.GOOGLE_AUTH_V2_URL}?${queryQS}`

      const waveboxOauthWin = new AuthWindow()
      waveboxOauthWin.create(authUrl, {
        useContentSize: true,
        center: true,
        show: true,
        resizable: false,
        standardWindow: true,
        autoHideMenuBar: true,
        title: 'Google',
        height: 750,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          nativeWindowOpen: true,
          sharedSiteInstances: true,
          partition: partitionId,
          preload: Resolver.guestPreload(),
          preloadCrx: Resolver.crExtensionApi()
        }
      })
      const oauthWin = waveboxOauthWin.window
      const emitter = SessionManager.webRequestEmitterFromPartitionId(partitionId)
      let userClose = true

      const handleHeadersReceived = (details, responder) => {
        if (details.webContentsId !== oauthWin.webContents.id) { return responder({}) }

        if (details.statusCode === 302) {
          let nextUrl
          try {
            nextUrl = new URL(
              details.responseHeaders.location || details.responseHeaders.Location,
              details.url
            ).toString()
          } catch (ex) {
            return responder({})
          }

          if (nextUrl.startsWith(credentials.GOOGLE_AUTH_V2_SUCCESS_URL)) {
            responder({ cancel: true })
            const purl = new URL(nextUrl)
            userClose = false
            oauthWin.close()
            resolve({
              email: purl.searchParams.get('email'),
              avatar: purl.searchParams.get('avatar')
            })
            return
          } else if (nextUrl.startsWith(credentials.GOOGLE_AUTH_V2_FAILURE_URL)) {
            responder({ cancel: true })
            userClose = false
            oauthWin.close()
            const purl = new URL(nextUrl)
            reject(new Error(purl.searchParams.get('error')))
            return
          }
        }

        responder({})
      }
      emitter.headersReceived.onBlocking(undefined, handleHeadersReceived)

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
  handleAuthGoogle (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToAuthenticate(body.credentials, body.partitionId))
      .then(({ push, google }) => {
        evt.sender.send(WB_AUTH_GOOGLE_COMPLETE, {
          mode: body.mode,
          context: body.context,
          auth: {
            temporaryCode: google,
            pushToken: push,
            codeRedirectUri: body.credentials.GOOGLE_AUTH_RETURN_URL
          }
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_GOOGLE_ERROR, {
          mode: body.mode,
          context: body.context,
          error: err,
          errorString: (err || {}).toString ? (err || {}).toString() : undefined,
          errorMessage: (err || {}).message ? (err || {}).message : undefined,
          errorStack: (err || {}).stack ? (err || {}).stack : undefined
        })
      })
  }
}

export default AuthGoogle
