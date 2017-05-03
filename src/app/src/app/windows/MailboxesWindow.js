const WaveboxWindow = require('./WaveboxWindow')
const path = require('path')
const MailboxesSessionManager = require('./MailboxesSessionManager')
const settingStore = require('../stores/settingStore')
const userStore = require('../stores/userStore')
const {
  AuthGoogle,
  AuthMicrosoft,
  AuthSlack,
  AuthTrello,
  AuthWavebox
} = require('../AuthProviders')
const querystring = require('querystring')
const electron = require('electron')

const MAILBOXES_DIR = path.resolve(path.join(__dirname, '/../../../scenes/mailboxes'))
const ALLOWED_URLS = [
  'file://' + path.join(MAILBOXES_DIR, 'mailboxes.html'),
  'file://' + path.join(MAILBOXES_DIR, 'offline.html')
]

class MailboxesWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super({
      screenLocationNS: 'mailbox_window_state'
    })
    this.authGoogle = new AuthGoogle()
    this.authTrello = new AuthTrello()
    this.authSlack = new AuthSlack()
    this.authMicrosoft = new AuthMicrosoft()
    this.authWavebox = new AuthWavebox()
    this.sessionManager = new MailboxesSessionManager(this)
  }

  /**
  * Generates the url for the window
  * @return a fully qualified url to give to the window object
  */
  generateWindowUrl () {
    const params = querystring.stringify({
      clientId: userStore.clientId,
      clientToken: userStore.clientToken
    })
    return `file://${path.join(MAILBOXES_DIR, 'mailboxes.html')}?${params}`
  }

  /**
  * @param url: the url to load
  * @param hidden=false: true to start the window hidden
  */
  start (hidden = false) {
    const screenSize = electron.screen.getPrimaryDisplay().workAreaSize
    super.start(this.generateWindowUrl(), {
      show: !hidden,
      minWidth: 770,
      minHeight: 300,
      width: Math.min(Math.max(screenSize.width, 770), 1200),
      height: Math.min(Math.max(screenSize.height, 300), 1000),
      fullscreenable: true,
      titleBarStyle: process.platform === 'darwin' && settingStore.ui.showTitlebar === false ? 'hidden' : 'default',
      frame: settingStore.ui.showTitlebar,
      title: 'Wavebox',
      backgroundColor: '#f2f2f2',
      webPreferences: {
        nodeIntegration: true
      }
    })
  }

  /* ****************************************************************************/
  // Creation & Closing
  /* ****************************************************************************/

  createWindow () {
    super.createWindow.apply(this, Array.from(arguments))

    // We're locking on to our window. This stops file drags redirecting the page
    this.window.webContents.on('will-navigate', (evt, url) => {
      const match = ALLOWED_URLS.findIndex((allowed) => allowed.indexOf(url) === 0)
      if (!match) {
        evt.preventDefault()
      }
    })

    // We can't prevent the devtools from reloading the page so we can't get the page to teardown
    // gracefully, but if the clientId or clientToken has changed we can at least issue a redirect
    // notice to the correct url with the correct credentials :)
    this.window.webContents.on('devtools-reload-page', (evt) => {
      this.window.loadURL(this.generateWindowUrl())
    })
  }

  destroyWindow (evt) {
    super.destroyWindow(evt)
  }

  /* ****************************************************************************/
  // Mailbox Actions
  /* ****************************************************************************/

  /**
  * Reloads the webview
  * @return this
  */
  reload () {
    this.window.webContents.send('prepare-reload', {})
    setTimeout(() => {
      this.window.loadURL(this.generateWindowUrl())
    }, 250)
    return this
  }

  /**
  * Launches the preferences modal
  * @return this
  */
  launchPreferences () {
    this.window.webContents.send('launch-settings', { })
    return this
  }

  /**
  * Toggles the sidebar
  * @return this
  */
  toggleSidebar () {
    this.window.webContents.send('toggle-sidebar', { })
    return this
  }

  /**
  * Toggles the app menu
  * @return this
  */
  toggleAppMenu () {
    this.window.webContents.send('toggle-app-menu', { })
    return this
  }

  /**
  * Tells the frame a download is complete
  * @param path: the path of the saved file
  * @param filename: the name of the file
  * @return this
  */
  downloadCompleted (path, filename) {
    this.window.webContents.send('download-completed', {
      path: path,
      filename: filename
    })
    return this
  }

  /**
  * Opens a mailto link
  * @param mailtoLink: the link to open
  * @return this
  */
  openMailtoLink (mailtoLink) {
    this.window.webContents.send('open-mailto-link', { mailtoLink: mailtoLink })
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Switching
  /* ****************************************************************************/

  /**
  * Switches mailbox
  * @param mailboxId: the id of the mailbox to switch to
  * @param serviceType=undefined: the type of service to also switch to if desired
  * @return this
  */
  switchMailbox (mailboxId, serviceType = undefined) {
    this.show().focus()
    this.window.webContents.send('switch-mailbox', {
      mailboxId: mailboxId,
      serviceType: serviceType
    })
    return this
  }

  /**
  * Switches to a service at the given index. This call will fail silently if there is no
  * service at the given index
  * @param index: the index you want to switch to
  * @return this
  */
  switchToServiceAtIndex (index) {
    this.show().focus()
    this.window.webContents.send('switch-service-index', {
      index: index
    })
    return this
  }

  /**
  * Switches to the previous mailbox
  * @return this
  */
  switchPrevMailbox () {
    this.show().focus()
    this.window.webContents.send('switch-mailbox', { prev: true })
    return this
  }

  /**
  * Switches to the next mailbox
  * @return this
  */
  switchNextMailbox () {
    this.show().focus()
    this.window.webContents.send('switch-mailbox', { next: true })
    return this
  }

  /**
  * Tells the active mailbox to navigate back
  * @return this
  */
  navigateMailboxBack () {
    this.show().focus()
    this.window.webContents.send('mailbox-window-navigate-back', { })
    return this
  }

  /**
  * Tells the active mailbox to navigate back
  * @return this
  */
  navigateMailboxForward () {
    this.show().focus()
    this.window.webContents.send('mailbox-window-navigate-forward', { })
    return this
  }

  /* ****************************************************************************/
  // Mailbox Actions: Squirrel
  /* ****************************************************************************/

  /**
  * Indicates that the squirrel update service downloaded an update
  */
  squirrelUpdateDownloaded () {
    this.window.webContents.send('squirrel-update-downloaded', { })
  }

  /**
  * Indicates that the squirrel update failed to check or fetch updates
  */
  squirrelUpdateError () {
    this.window.webContents.send('squirrel-update-error', { })
  }

  /**
  * Indicates that the squirrel update is available
  */
  squirrelUpdateAvailable () {
    this.window.webContents.send('squirrel-update-available', { })
  }

  /**
  * Indicates that the squirrel update is not available
  */
  squirrelUpdateNotAvailable () {
    this.window.webContents.send('squirrel-update-not-available', { })
  }

  /**
  * Indicates that squirrel is checking for updates
  */
  squirrelCheckingForUpdate () {
    this.window.webContents.send('squirrel-update-check-start', { })
  }
}

module.exports = MailboxesWindow
