import { app, ipcMain } from 'electron'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import TrayPopout from './TrayPopout'
import {
  WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY,
  WB_SHOW_MAILBOX_WINDOW_FROM_TRAY,
  WB_HIDE_MAILBOX_WINDOW_FROM_TRAY,
  WB_TOGGLE_TRAY_POPOUT,
  WB_HIDE_TRAY,
  WB_SHOW_TRAY,
  WB_SHOW_TRAY_WINDOWED,
  WB_SHOW_TRAY_DOCKED,
  WB_TRAY_TOGGLE_WINDOW_MODE
} from 'shared/ipcEvents'

class WaveboxTrayBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY, this.ipcToggleMailboxesWindow)
    ipcMain.on(WB_SHOW_MAILBOX_WINDOW_FROM_TRAY, this.ipcShowMailboxesWindow)
    ipcMain.on(WB_HIDE_MAILBOX_WINDOW_FROM_TRAY, this.ipcHideAllWindows)
    ipcMain.on(WB_TOGGLE_TRAY_POPOUT, this.ipcToggleTrayPopout)
    ipcMain.on(WB_HIDE_TRAY, this.ipcHideTray)
    ipcMain.on(WB_SHOW_TRAY, this.ipcShowTray)
    ipcMain.on(WB_SHOW_TRAY_WINDOWED, this.ipcShowTrayWindowed)
    ipcMain.on(WB_SHOW_TRAY_DOCKED, this.ipcShowTrayDocked)
    ipcMain.on(WB_TRAY_TOGGLE_WINDOW_MODE, this.ipcToggleTrayWindowMode)
  }

  setup () { /* no-op */ }

  /* ****************************************************************************/
  // Data utils
  /* ****************************************************************************/

  /**
  * Gets the mailboxes window
  * @return the mailboxes window or undefined
  */
  _getMailboxesWindow () {
    return WaveboxWindow.getOfType(MailboxesWindow)
  }

  /* ****************************************************************************/
  // Toggling
  /* ****************************************************************************/

  /**
  * Toggles the mailboxes window visibility by hiding or showing the mailboxes windoww
  * @param evt: the event that fired
  */
  ipcToggleMailboxesWindow = (evt) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (!mailboxesWindow) { return }

    if (mailboxesWindow.isVisible() && !mailboxesWindow.isMinimized()) {
      this.ipcHideAllWindows(evt)
    } else {
      this.ipcShowMailboxesWindow(evt)
    }
  }

  /* ****************************************************************************/
  // Showing
  /* ****************************************************************************/

  /**
  * Shows and focuses the mailboxes window
  * @param evt: the event that fired
  */
  ipcShowMailboxesWindow = (evt) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (mailboxesWindow) {
      mailboxesWindow.show()
      mailboxesWindow.focus()
    }
  }

  /**
  * Hides all windows
  * @param evt: the event that fired
  */
  ipcHideAllWindows = (evt) => {
    if (process.platform === 'win32') {
      WaveboxWindow.all().forEach((win) => {
        win.minimize()
      })
    } else if (process.platform === 'darwin') {
      const mailboxesWindow = this._getMailboxesWindow()
      if (mailboxesWindow) {
        mailboxesWindow.hide()
      }
      app.hide()
    } else if (process.platform === 'linux') {
      const mailboxesWindow = this._getMailboxesWindow()
      if (mailboxesWindow) {
        mailboxesWindow.hide()
      }
    }
  }

  /* ****************************************************************************/
  // Popout
  /* ****************************************************************************/

  /**
  * Toggles the tray popout
  * @param evt: the event that fired
  * @param bounds: the bounds of the tray
  */
  ipcToggleTrayPopout = (evt, bounds) => {
    TrayPopout.toggleVisibility(bounds)
  }

  /**
  * Hides the tray popout
  * @param evt: the event that fired
  */
  ipcHideTray = (evt) => {
    TrayPopout.hide()
  }

  /**
  * Shows the tray popout
  * @param evt: the event that fired
  * @param bounds: the bounds of the tray
  */
  ipcShowTray = (evt, bounds) => {
    TrayPopout.show(bounds)
  }

  /**
  * Shows the tray in windowed mode
  * @param evt: the event that fired
  */
  ipcShowTrayWindowed = (evt) => {
    TrayPopout.showInWindowMode()
  }

  /**
  * Shows the tray in docked mode
  * @param evt: the event that fired
  */
  ipcShowTrayDocked = (evt) => {
    TrayPopout.showInDockedMode()
  }

  /**
  * Toggles the window mode of the tray
  * @param evt: the event that fired
  */
  ipcToggleTrayWindowMode = (evt) => {
    TrayPopout.toggleWindowMode()
  }
}

export default new WaveboxTrayBehaviour()
