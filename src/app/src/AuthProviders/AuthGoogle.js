import { ipcMain } from 'electron'
import { WB_AUTH_GOOGLE, WB_AUTH_GOOGLE_COMPLETE, WB_AUTH_GOOGLE_ERROR } from 'shared/ipcEvents'
import { userStore } from 'stores/user'
import { URL } from 'url'
import querystring from 'querystring'
import pkg from 'package.json'
import AuthWindow from 'Windows/AuthWindow'
import { SessionManager } from 'SessionManager'

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
  * Generates the authentication url for our secrets, scopes and access type
  * @param credentials: the credentials to use
  * @return the url that can be used to authenticate with goog
  */
  generateGoogleAuthenticationURL (credentials) {
    // Compatable with calling  (new require('googleapis').auth.OAuth2(...)).generateAuthUrl()
    return `https://accounts.google.com/o/oauth2/auth?${querystring.stringify({
      client_id: credentials.GOOGLE_CLIENT_ID,
      redirect_uri: credentials.GOOGLE_AUTH_RETURN_URL,
      access_type: 'offline',
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/plus.me',
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.readonly'
      ].join(' ')
    })}`
  }

  /**
  * Generates the url for authenticating with the push service
  * @param credentials: the credentials to use
  * @return the url that can be used
  */
  generatePushServiceAuthenticationURL (credentials) {
    const userState = userStore.getState()
    const query = querystring.stringify({
      client_id: userState.clientId,
      client_token: userState.clientToken,
      client_version: pkg.version
    })
    return `${credentials.GOOGLE_PUSH_SERVICE_AUTH_URL}?${query}`
  }

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param credentials: the credentials to use
  * @param partitionId: the id of the partition
  * @return promise
  */
  promptUserToGetAuthorizationCode (credentials, partitionId) {
    return new Promise((resolve, reject) => {
      const waveboxOauthWin = new AuthWindow()
      waveboxOauthWin.create(this.generatePushServiceAuthenticationURL(credentials), {
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
          partition: partitionId
        }
      })
      const oauthWin = waveboxOauthWin.window
      const emitter = SessionManager.webRequestEmitterFromPartitionId(partitionId)
      let userClose = true

      // Step 1: Handle push service auth
      let pushServiceToken
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

          if (nextUrl.startsWith(credentials.GOOGLE_PUSH_SERVICE_SUCCESS_URL)) {
            responder({ cancel: true })
            const purl = new URL(nextUrl)
            pushServiceToken = purl.searchParams.get('token')
            oauthWin.loadURL(this.generateGoogleAuthenticationURL(credentials))
            return
          } else if (nextUrl.startsWith(credentials.GOOGLE_PUSH_SERVICE_FAILURE_URL)) {
            responder({ cancel: true })
            userClose = false
            oauthWin.close()
            const purl = new URL(nextUrl)
            reject(new Error(purl.searchParams.get('token')))
            return
          }
        }

        responder({})
      }
      emitter.headersReceived.onBlocking(undefined, handleHeadersReceived)

      // Step 2: Handle Google auth
      oauthWin.on('page-title-updated', (evt) => {
        if (!pushServiceToken) { return }
        setTimeout(() => {
          const title = oauthWin.getTitle()
          if (title.startsWith('Denied')) {
            userClose = false
            oauthWin.close()
            reject(new Error(title.split(/[ =]/)[2]))
          } else if (title.startsWith('Success')) {
            userClose = false
            oauthWin.close()
            resolve({
              push: pushServiceToken,
              google: title.split(/[ =]/)[2]
            })
          }
        })
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
  handleAuthGoogle (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToGetAuthorizationCode(body.credentials, body.partitionId))
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
