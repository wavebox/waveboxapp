const { ipcMain, BrowserWindow } = require('electron')
const { WB_AUTH_MICROSOFT, WB_AUTH_MICROSOFT_COMPLETE, WB_AUTH_MICROSOFT_ERROR } = require('../../shared/ipcEvents')
const url = require('url')
const querystring = require('querystring')

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
  * @return the url that can be used to authenticate with goog
  */
  generateMicrosoftAuthenticationURL (credentials) {
    const query = querystring.stringify({
      client_id: credentials.MICROSOFT_CLIENT_ID_V2,
      redirect_uri: credentials.MICROSOFT_AUTH_RETURN_URL_V2,
      response_type: 'code',
      scope: [
        'offline_access',
        'User.Read',
        'Mail.Read',
        'Files.Read'
      ].join(' ')
    })
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`
  }

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param credentials: the credentials to use
  * @param partitionId: the id of the partition
  * @return promise
  */
  promptUserToGetAuthorizationCode (credentials, partitionId) {
    return new Promise((resolve, reject) => {
      const oauthWin = new BrowserWindow({
        useContentSize: true,
        center: true,
        show: true,
        resizable: false,
        alwaysOnTop: true,
        standardWindow: true,
        autoHideMenuBar: true,
        title: 'Microsoft',
        height: 750,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: partitionId.indexOf('persist:') === 0 ? partitionId : 'persist:' + partitionId
        }
      })

      oauthWin.loadURL(this.generateMicrosoftAuthenticationURL(credentials))

      oauthWin.on('closed', () => {
        reject(new Error('User closed the window'))
      })

      // Listen for changes
      oauthWin.webContents.on('did-get-redirect-request', (evt, prevUrl, nextUrl) => {
        if (nextUrl.indexOf(credentials.MICROSOFT_AUTH_RETURN_URL_V2) === 0) {
          evt.preventDefault()
          const purl = url.parse(nextUrl, true)
          if (purl.query.code) {
            oauthWin.removeAllListeners('closed')
            oauthWin.close()
            resolve(purl.query.code)
          } else if (purl.query.error) {
            oauthWin.removeAllListeners('closed')
            oauthWin.close()

            if (purl.query.error === 'access_denied') {
              reject(new Error(purl.query.error_description))
            } else {
              reject(new Error(`${purl.query.error}:${purl.query.error_subcode}:${purl.query.error_description}`))
            }
          }
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
      .then(() => this.promptUserToGetAuthorizationCode(body.credentials, body.id))
      .then((temporaryCode) => {
        evt.sender.send(WB_AUTH_MICROSOFT_COMPLETE, {
          id: body.id,
          authMode: body.authMode,
          provisional: body.provisional,
          temporaryCode: temporaryCode,
          codeRedirectUri: body.credentials.MICROSOFT_AUTH_RETURN_URL_V2
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_MICROSOFT_ERROR, {
          id: body.id,
          authMode: body.authMode,
          provisional: body.provisional,
          error: err,
          errorString: (err || {}).toString ? (err || {}).toString() : undefined,
          errorMessage: (err || {}).message ? (err || {}).message : undefined,
          errorStack: (err || {}).stack ? (err || {}).stack : undefined
        })
      })
  }
}

module.exports = AuthMicrosoft
