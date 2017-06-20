const { ipcMain, BrowserWindow } = require('electron')
const { WB_AUTH_SLACK, WB_AUTH_SLACK_COMPLETE, WB_AUTH_SLACK_ERROR } = require('../../shared/ipcEvents')
const url = require('url')

class AuthSlack {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_AUTH_SLACK, (evt, body) => {
      this.handleAuthSlack(evt, body)
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

      oauthWin.webContents.on('will-navigate', (evt, nextUrl) => {
        const purl = url.parse(nextUrl, true)
        if (purl.host === 'slack.com' && purl.pathname.indexOf('/checkcookie') === 0 && purl.query.redir) {
          oauthWin.hide()
        }
      })
      oauthWin.webContents.on('dom-ready', (evt) => {
        oauthWin.webContents.executeJavaScript('(window.TS || {}).boot_data', (bootData) => {
          if (bootData && bootData.team_url && bootData.api_token) {
            oauthWin.removeAllListeners('closed')
            oauthWin.close()
            resolve({ teamUrl: bootData.team_url, token: bootData.api_token })
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
  handleAuthSlack (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToGetAuthorizationCode(body.id))
      .then(({ teamUrl, token }) => {
        evt.sender.send(WB_AUTH_SLACK_COMPLETE, {
          id: body.id,
          authMode: body.authMode,
          provisional: body.provisional,
          teamUrl: teamUrl,
          token: token
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_SLACK_ERROR, {
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

module.exports = AuthSlack
