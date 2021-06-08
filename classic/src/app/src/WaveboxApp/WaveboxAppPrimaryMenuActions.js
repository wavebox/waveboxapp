import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import { shell, dialog, webContents, clipboard } from 'electron'
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
import { accountStore } from 'stores/account'
import LinkOpener from 'LinkOpener'
import DistributionConfig from 'Runtime/DistributionConfig'

class WaveboxAppPrimaryMenuActions {
  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @return the mailboxes window
  */
  _getMailboxesWindow () {
    return WaveboxWindow.getOfType(MailboxesWindow)
  }

  /**
  * @return the focused web contents
  */
  _getFocusedWebContents () {
    // Do dev tools first as these may not correlate to the opened Wavebox window
    const withFocusedDevTools = webContents
      .getAllWebContents()
      .filter((wc) => wc.isDevToolsOpened() && wc.isDevToolsFocused())
    if (withFocusedDevTools[0]) {
      return withFocusedDevTools[0].devToolsWebContents
    } else {
      const win = WaveboxWindow.focused()
      return win ? win.focusedEditableWebContents() : undefined
    }
  }

  /* ****************************************************************************/
  // App Lifecycle
  /* ****************************************************************************/

  fullQuit = (accelerator) => {
    const focused = WaveboxWindow.focused()
    if (focused) {
      const res = focused.onBeforeFullQuit(accelerator)
      if (res === true) { return }
    }

    evtMain.emit(evtMain.WB_QUIT_APP, {})
  }

  restartSafeMode = () => {
    evtMain.emit(evtMain.WB_RELAUNCH_APP_SAFE, {})
  }

  restartWithoutHWAcceleration = () => {
    settingsActions.sub.app.disableHardwareAcceleration(true)
    setTimeout(() => { // Bad fix for letting the store update
      evtMain.emit(evtMain.WB_RELAUNCH_APP, {})
    }, 1000)
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
  // Editing
  /* ****************************************************************************/

  undo = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.undo() }
  }

  redo = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.redo() }
  }

  cut = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.cut() }
  }

  copy = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.copy() }
  }

  paste = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.paste() }
  }

  pasteAndMatchStyle = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.pasteAndMatchStyle() }
  }

  selectAll = () => {
    const wc = this._getFocusedWebContents()
    if (wc) { wc.selectAll() }
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

  toggleWaveboxMini = () => {
    // (Thomas101) this is ripe for refactoring. The tray should be created
    // on the main thread
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.__depricatedToggleTray()
    }
  }

  /* ****************************************************************************/
  // Wavebox actions
  /* ****************************************************************************/

  addAccount = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.addAccount()
    }
  }

  composeMail = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus()
    }
    emblinkActions.composeNewMessage()
  }

  composeMailHere = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show().focus()
    }
    emblinkActions.composeNewMessage(accountStore.getState().activeServiceId())
  }

  checkForUpdate = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.userCheckForUpdate()
    }
  }

  openCommandPalette = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.openCommandPalette()
    }
  }

  /* ****************************************************************************/
  // Scene navigation
  /* ****************************************************************************/

  preferences = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.launchPreferences()
    }
  }

  supportCenter = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.launchSupportCenter()
    }
  }

  waveboxAccount = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.launchWaveboxAccount()
    }
  }

  whatsNew = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.launchWhatsNew()
    }
  }

  aboutDialog = () => {
    dialog.showMessageBox({
      title: pkg.name,
      message: pkg.name,
      detail: [
        Release.generateVersionComponents(pkg, undefined, DistributionConfig.installMethod).join('\n'),
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
  support = () => {
    const url = [
      SUPPORT_URL,
      SUPPORT_URL.indexOf('?') === -1 ? '?' : '&',
      '&app_version=' + encodeURIComponent(pkg.version)
    ].join('')
    shell.openExternal(url)
  }
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

  changeMailbox = (mailboxId) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchMailbox(mailboxId)
    }
  }

  changeService = (serviceId) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchService(serviceId)
    }
  }

  changeMailboxServiceToIndex = (index) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchToServiceAtIndex(index)
    }
  }

  prevMailbox = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchPrevMailbox(true)
    }
  }

  nextMailbox = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchNextMailbox(true)
    }
  }

  prevService = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchPrevService(true)
    }
  }

  nextService = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchNextService(true)
    }
  }

  nextMailboxTab = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchNextTab()
    }
  }

  prevMailboxTab = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.switchPrevTab()
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

  openNextActiveReadingQueueLink = () => {
    LinkOpener.openNextActiveReadingQueueLink()
  }

  quickSwitchNext = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchNext()
    }
  }

  quickSwitchPrev = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchPrev()
    }
  }

  quickSwitchPresentOptionsNext = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchPresentOptionsNext()
    }
  }

  quickSwitchPresentOptionsPrev = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchPresentOptionsPrev()
    }
  }

  quickSwitchNextOption = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchNextOption()
    }
  }

  quickSwitchPrevOption = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchPrevOption()
    }
  }

  quickSwitchSelectOption = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.quickSwitchSelectOption()
    }
  }

  /* ****************************************************************************/
  // Copy tools
  /* ****************************************************************************/

  copyCurrentTabUrl = () => {
    const focusedWindow = WaveboxWindow.focused()
    if (!focusedWindow) { return }
    const focusedTabId = focusedWindow.focusedTabId()
    if (focusedTabId === undefined) { return }
    const focusedWebContents = webContents.fromId(focusedTabId)
    if (!focusedWebContents) { return }
    clipboard.writeText(focusedWebContents.getURL())
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

export default new WaveboxAppPrimaryMenuActions()
