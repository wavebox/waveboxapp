import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import { shell, dialog } from 'electron'
import Release from 'shared/Release'
import pkg from 'package.json'
import {
  GITHUB_URL,
  BLOG_URL,
  WEB_URL,
  PRIVACY_URL,
  KB_URL,
  EULA_URL,
  SUPPORT_URL
} from 'shared/constants'
import { evtMain } from 'AppEvents'
import { settingsActions } from 'stores/settings'
import { emblinkActions } from 'stores/emblink'

class WaveboxAppPrimaryMenuAcions {
  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @return the mailboxes window
  */
  _getMailboxesWindow () {
    return WaveboxWindow.getOfType(MailboxesWindow)
  }

  /* ****************************************************************************/
  // App Lifecycle
  /* ****************************************************************************/
  fullQuit = () => {
    evtMain.emit(evtMain.WB_QUIT_APP, {})
  }

  closeWindow = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.close() }
  }

  showWindow = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus()
    }
  }

  reload = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.reload() }
  }

  reloadWavebox = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.reloadWaveboxWindow() }
  }

  hideAll = () => {
    WaveboxWindow.all().forEach((w) => w.hide())
  }

  showAll = () => {
    WaveboxWindow.all().forEach((w) => w.show())
  }

  /* ****************************************************************************/
  // Dev
  /* ****************************************************************************/

  devTools = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.openDevTools() }
  }

  devToolsWavebox = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.openWaveboxDevTools() }
  }

  /* ****************************************************************************/
  // Window & Display
  /* ****************************************************************************/

  fullscreenToggle = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.toggleFullscreen() }
  }

  sidebarToggle = () => {
    settingsActions.sub.ui.toggleSidebar()
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus()
    }
  }

  menuToggle = () => {
    settingsActions.sub.ui.toggleAppMenu()
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus()
    }
  }

  cycleWindows = () => {
    WaveboxWindow.cycleNextWindow()
  }

  /* ****************************************************************************/
  // Wavebox actions
  /* ****************************************************************************/

  addAccount = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().addAccount()
    }
  }

  composeMail = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus()
    }
    emblinkActions.composeNewMessage()
  }

  checkForUpdate = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().userCheckForUpdate()
    }
  }

  /* ****************************************************************************/
  // Scene navigation
  /* ****************************************************************************/

  preferences = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().launchPreferences()
    }
  }

  supportCenter = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().launchSupportCenter()
    }
  }
  whatsNew = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().launchWhatsNew()
    }
  }

  aboutDialog = () => {
    dialog.showMessageBox({
      title: pkg.name,
      message: pkg.name,
      detail: [
        Release.generateVersionString(pkg, '\n'),
        'Made with ♥ at wavebox.io'
      ].filter((l) => !!l).join('\n'),
      buttons: [ 'Done', 'Website' ]
    }, (index) => {
      if (index === 1) {
        shell.openExternal(WEB_URL)
      }
    })
  }

  /* ****************************************************************************/
  // External navigation
  /* ****************************************************************************/

  waveboxGithub = () => { shell.openExternal(GITHUB_URL) }
  waveboxWebsite = () => { shell.openExternal(WEB_URL) }
  waveboxBlog = () => { shell.openExternal(BLOG_URL) }
  privacy = () => { shell.openExternal(PRIVACY_URL) }
  eula = () => { shell.openExternal(EULA_URL) }
  support = () => { shell.openExternal(SUPPORT_URL) }
  knowledgeBase = () => { shell.openExternal(KB_URL) }

  /* ****************************************************************************/
  // Display
  /* ****************************************************************************/

  zoomIn = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.zoomIn() }
  }
  zoomOut = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.zoomOut() }
  }
  zoomReset = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.zoomReset() }
  }

  /* ****************************************************************************/
  // Mailbox navigation
  /* ****************************************************************************/

  changeMailbox = (mailboxId, serviceType = undefined) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().switchMailbox(mailboxId, serviceType)
    }
  }
  changeMailboxServiceToIndex = (index) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().switchToServiceAtIndex(index)
    }
  }
  prevMailbox = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().switchPrevMailbox(true)
    }
  }
  nextMailbox = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().switchNextMailbox(true)
    }
  }
  prevService = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().switchPrevService(true)
    }
  }
  nextService = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().switchNextService(true)
    }
  }

  mailboxNavBack = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.navigateBack() }
  }
  mailboxNavForward = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.navigateForward() }
  }

  /* ****************************************************************************/
  // Search
  /* ****************************************************************************/

  find = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.findStart() }
  }
  findNext = () => {
    const focused = WaveboxWindow.focused()
    if (focused) { focused.findNext() }
  }
}

export default new WaveboxAppPrimaryMenuAcions()
