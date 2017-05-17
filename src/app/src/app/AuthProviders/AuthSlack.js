const { ipcMain, BrowserWindow } = require('electron')
const url = require('url')

class AuthSlack {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on('auth-slack', (evt, body) => {
      this.handleAuthTrello(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param partitionId: the id of the partition
  * @return promise
  */
  promptUserToGetAuthorizationCode (partitionId) {
    return new Promise((resolve, reject) => {
      const oauthWin = new BrowserWindow({
        useContentSize: true,
        center: true,
        show: true,
        resizable: false,
        alwaysOnTop: true,
        standardWindow: true,
        autoHideMenuBar: true,
        title: 'Slack',
        height: 750,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: partitionId.indexOf('persist:') === 0 ? partitionId : 'persist:' + partitionId
        }
      })

      oauthWin.loadURL('https://slack.com/signin')
      oauthWin.on('closed', () => {
        reject(new Error('User closed the window'))
      })

      let teamUrl
      oauthWin.webContents.on('will-navigate', (evt, nextUrl) => {
        const purl = url.parse(nextUrl, true)
        if (purl.host === 'slack.com' && purl.pathname.indexOf('/checkcookie') === 0 && purl.query.redir) {
          teamUrl = purl.query.redir
          oauthWin.hide()
        }
      })
      oauthWin.webContents.on('dom-ready', (evt) => {
        oauthWin.webContents.executeJavaScript('((window.TS || {}).boot_data || {}).api_token', (token) => {
          if (token) {
            oauthWin.removeAllListeners('closed')
            oauthWin.close()
            resolve({ teamUrl: teamUrl, token: token })
          }
        })
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
  handleAuthTrello (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToGetAuthorizationCode(body.id))
      .then(({ teamUrl, token }) => {
        evt.sender.send('auth-slack-complete', {
          id: body.id,
          provisional: body.provisional,
          teamUrl: teamUrl,
          token: token
        })
      }, (err) => {
        evt.sender.send('auth-slack-error', {
          id: body.id,
          provisional: body.provisional,
          error: err,
          errorString: (err || {}).toString ? (err || {}).toString() : undefined,
          errorMessage: (err || {}).message ? (err || {}).message : undefined,
          errorStack: (err || {}).stack ? (err || {}).stack : undefined
        })
      })
  }
}

module.exports = AuthSlack
