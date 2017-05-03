const { ipcMain, BrowserWindow } = require('electron')

class AuthGoogle {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on('auth-generic-3rdparty', (evt, body) => {
      this.handleAuthGeneric(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Prompts the user to authorize through a semi-normal authentication flow
  * @param partitionId: the id of the partition
  * @param url: the url to open
  * @param guestInstanceId: the guest instance id from the spawner
  * @param openerId: the id of the opener from the spawner
  */
  promptUserToAuthorize (partitionId, url, guestInstanceId, openerId) {
    const oauthWin = new BrowserWindow({
      useContentSize: true,
      center: true,
      show: true,
      resizable: true,
      alwaysOnTop: true,
      standardWindow: true,
      autoHideMenuBar: true,
      title: 'Wavebox',
      height: 750,
      webPreferences: {
        nodeIntegration: false,
        partition: partitionId.indexOf('persist:') === 0 ? partitionId : 'persist:' + partitionId,
        guestInstanceId: guestInstanceId,
        openerId: openerId
      }
    })
    oauthWin.loadURL(url)
  }

  /* ****************************************************************************/
  // Request Handlers
  /* ****************************************************************************/

  /**
  * Handles the oauth request
  * @param evt: the incoming event
  * @param body: the body sent to us
  */
  handleAuthGeneric (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToAuthorize(body.id, body.url, body.guestInstanceId, body.openerId))
  }
}

module.exports = AuthGoogle
