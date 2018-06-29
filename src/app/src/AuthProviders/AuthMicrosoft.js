import { ipcMain } from 'electron'
import { WB_AUTH_MICROSOFT, WB_AUTH_MICROSOFT_COMPLETE, WB_AUTH_MICROSOFT_ERROR } from 'shared/ipcEvents'
import AuthWindow from 'Windows/AuthWindow'
import { URL } from 'url'
import querystring from 'querystring'
import { userStore } from 'stores/user'
import pkg from 'package.json'
import { SessionManager } from 'SessionManager'

class AuthMicrosoft {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_AUTH_MICROSOFT, (evt, body) => {
      this.handleAuthMicrosoft(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Generates the authentication url for our secrets, scopes and access type
  * @param credentials: the credentials to use
  * @param additionalPermissions: additionalPermissions to request
  * @return the url that can be used to authenticate with goog
  */
  generateMicrosoftAuthenticationURL (credentials, additionalPermissions) {
    const scopes = new Set([
      'offline_access',
      'User.Read',
      'Mail.Read',
      'Files.Read'
    ].concat(additionalPermissions))
    const scope = Array.from(scopes).join(' ')

    const query = querystring.stringify({
      client_id: credentials.MICROSOFT_CLIENT_ID_V2,
      redirect_uri: credentials.MICROSOFT_AUTH_RETURN_URL_V2,
      response_type: 'code',
      scope: scope
    })
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`
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
    return `${credentials.MICROSOFT_PUSH_SERVICE_AUTH_URL}?${query}`
  }

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param credentials: the credentials to use
  * @param partitionId: the id of the partition
  * @param additionalPermissions: a list of additional permission to request
  * @return promise
  */
  promptUserToGetAuthorizationCode (credentials, partitionId, additionalPermissions) {
    return new Promise((resolve, reject) => {
      const waveboxOauthWin = new AuthWindow()
      waveboxOauthWin.create(this.generatePushServiceAuthenticationURL(credentials), {
        useContentSize: true,
        center: true,
        show: true,
        resizable: false,
        standardWindow: true,
        autoHideMenuBar: true,
        title: 'Microsoft',
        height: 750,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: partitionId,
          sandbox: true,
          nativeWindowOpen: true,
          sharedSiteInstances: true
        }
      })
      const oauthWin = waveboxOauthWin.window
      const emitter = SessionManager.webRequestEmitterFromPartitionId(partitionId)

      let userClose = true

      // Auth callback
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

          if (nextUrl.indexOf(credentials.MICROSOFT_PUSH_SERVICE_SUCCESS_URL) === 0) {
            responder({ cancel: true })
            oauthWin.loadURL(this.generateMicrosoftAuthenticationURL(credentials, additionalPermissions))
            return
          } else if (nextUrl.indexOf(credentials.MICROSOFT_PUSH_SERVICE_FAILURE_URL) === 0) {
            userClose = false
            oauthWin.close()
            const purl = new URL(nextUrl)
            responder({ cancel: true })
            reject(new Error(purl.searchParams.get('error')))
            return
          } else if (nextUrl.indexOf(credentials.MICROSOFT_AUTH_RETURN_URL_V2) === 0) {
            const purl = new URL(nextUrl)
            if (purl.searchParams.get('code')) {
              responder({ cancel: true })
              userClose = false
              oauthWin.close()
              resolve(purl.searchParams.get('code'))
              return
            } else if (purl.searchParams.get('error')) {
              responder({ cancel: true })
              userClose = false
              oauthWin.close()

              if (purl.searchParams.get('error') === 'access_denied') {
                reject(new Error(purl.searchParams.get('error_description')))
              } else {
                reject(new Error(`${purl.searchParams.get('error')}:${purl.searchParams.get('error_subcode')}:${purl.searchParams.get('error_description')}`))
              }
              return
            }
          }
        }

        responder({})
      }
      emitter.headersReceived.onBlocking(undefined, handleHeadersReceived)

      // Window close callback
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
  handleAuthMicrosoft (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToGetAuthorizationCode(body.credentials, body.partitionId, body.additionalPermissions))
      .then((temporaryCode) => {
        evt.sender.send(WB_AUTH_MICROSOFT_COMPLETE, {
          mode: body.mode,
          context: body.context,
          auth: {
            temporaryCode: temporaryCode,
            codeRedirectUri: body.credentials.MICROSOFT_AUTH_RETURN_URL_V2
          }
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_MICROSOFT_ERROR, {
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

export default AuthMicrosoft
