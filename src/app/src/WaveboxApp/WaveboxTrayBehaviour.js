import { app, ipcMain } from 'electron'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import { TrayPopout } from 'Tray'
import {
  WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY,
  WB_SHOW_MAILBOX_WINDOW_FROM_TRAY,
  WB_TOGGLE_TRAY_POPOUT
} from 'shared/ipcEvents'

class WaveboxTrayBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY, this.toggleMailboxesWindow)
    ipcMain.on(WB_SHOW_MAILBOX_WINDOW_FROM_TRAY, this.showMailboxesWindow)
    ipcMain.on(WB_TOGGLE_TRAY_POPOUT, this.toggleTrayPopout)
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
  * @param minimize=false: set to true to prefer minimize (on platforms that support it)
  */
  toggleMailboxesWindow = (evt, minimize = false) => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (!mailboxesWindow) { return }

    if (process.platform === 'win32') {
      // On windows clicking on non-window elements (e.g. tray) causes window
      // to lose focus, so the window will never have focus
      if (mailboxesWindow.isVisible() && !mailboxesWindow.isMinimized()) {
        if (minimize) {
          mailboxesWindow.minimize()
        } else {
          mailboxesWindow.close()
        }
      } else {
        mailboxesWindow.show()
        mailboxesWindow.focus()
      }
    } else {
      if (mailboxesWindow.isVisible()) {
        if (mailboxesWindow.isFocused()) {
          if (process.platform === 'darwin') {
            mailboxesWindow.hide()
            app.hide()
          } else {
            mailboxesWindow.hide()
          }
        } else {
          mailboxesWindow.focus()
        }
      } else {
        mailboxesWindow.show()
        mailboxesWindow.focus()
      }
    }
  }

  /* ****************************************************************************/
  // Showing
  /* ****************************************************************************/

  /**
  * Shows and focuses the mailboxes window
  */
  showMailboxesWindow = () => {
    const mailboxesWindow = this._getMailboxesWindow()
    if (!mailboxesWindow) { return }
    mailboxesWindow.show()
    mailboxesWindow.focus()
  }

  /* ****************************************************************************/
  // Popout
  /* ****************************************************************************/

  /**
  * Toggles the tray popout
  * @param evt: the event that fired
  * @param bounds: the bounds of the tray
  * @param actionKey: true if an action key was used
  */
  toggleTrayPopout = (evt, bounds, actionKey) => {
    if (actionKey) {
      TrayPopout.hide()
    } else {
      TrayPopout.toggle(bounds)
    }
  }
}

export default new WaveboxTrayBehaviour()
