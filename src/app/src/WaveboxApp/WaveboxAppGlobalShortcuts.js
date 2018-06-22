import { globalShortcut, app } from 'electron'
import { settingsStore } from 'stores/settings'
import { accountStore, accountActions } from 'stores/account'
import MailboxesWindow from 'Windows/MailboxesWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'

const privConfig = Symbol('privConfig')
const privState = Symbol('privState')

class WaveboxAppGlobalShortcuts {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConfig] = [
      { selector: this._handleToggle, accelerator: '', acceleratorName: 'globalToggleApp' },
      { selector: this._handleToggleMini, accelertor: '', acceleratorName: 'globalToggleWaveboxMini' },
      { selector: this._handleShowMailbox0, accelerator: '', acceleratorName: 'globalShowAppMailbox0' },
      { selector: this._handleShowMailbox1, accelerator: '', acceleratorName: 'globalShowAppMailbox1' },
      { selector: this._handleShowMailbox2, accelerator: '', acceleratorName: 'globalShowAppMailbox2' },
      { selector: this._handleShowMailbox3, accelerator: '', acceleratorName: 'globalShowAppMailbox3' },
      { selector: this._handleShowMailbox4, accelerator: '', acceleratorName: 'globalShowAppMailbox4' },
      { selector: this._handleShowMailbox5, accelerator: '', acceleratorName: 'globalShowAppMailbox5' },
      { selector: this._handleShowMailbox6, accelerator: '', acceleratorName: 'globalShowAppMailbox6' },
      { selector: this._handleShowMailbox7, accelerator: '', acceleratorName: 'globalShowAppMailbox7' },
      { selector: this._handleShowMailbox8, accelerator: '', acceleratorName: 'globalShowAppMailbox8' },
      { selector: this._handleShowMailbox9, accelerator: '', acceleratorName: 'globalShowAppMailbox9' }
    ]
    this[privState] = {
      accelerators: settingsStore.getState().accelerators
    }
  }

  /**
  * Creates all the bindings
  */
  register () {
    this.updateGlobalAccelerators(this[privState].accelerators)
    settingsStore.listen(this.handleAcceleratorSettingsChanged)
  }

  /**
  * Removes all bindings
  */
  unregister () {
    settingsStore.unlisten(this.handleAcceleratorSettingsChanged)
    this[privConfig].forEach((config) => {
      if (config.accelerator) {
        try {
          globalShortcut.unregister(config.accelerator)
        } catch (ex) { /* no-op: invalid shortcut */ }
      }
      config.accelerator = ''
    })
  }

  /* ****************************************************************************/
  // Data lifecycle
  /* ****************************************************************************/

  /**
  * Handles the accelerator settings changing
  * @param { next }: the next settings
  */
  handleAcceleratorSettingsChanged = (settingsState) => {
    if (settingsState.accelerators !== this[privState].accelerators) {
      this[privState].accelerators = settingsState.accelerators
      this.updateGlobalAccelerators(settingsState.accelerators)
    }
  }

  /* ****************************************************************************/
  // Updating
  /* ****************************************************************************/

  /**
  * Updates the accelerators
  * @param accelerators: the accelerator settings
  * @return a dictionary of function to accelerator
  */
  updateGlobalAccelerators (accelerators) {
    this[privConfig].forEach((config) => {
      const accelerator = accelerators[config.acceleratorName]
      if (accelerator !== config.accelerator) {
        if (config.accelerator) {
          try {
            globalShortcut.unregister(config.accelerator)
          } catch (ex) { /* no-op: invalid shortcut */ }
        }
        if (accelerator) {
          try {
            globalShortcut.register(accelerator, config.selector)
          } catch (ex) { /* no-op: invalid shortcut */ }
        }

        config.accelerator = accelerator
      }
    })
  }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Toggles the main mailboxes window in the same way the tray does
  */
  _handleToggle = () => {
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    if (mailboxesWindow.isVisible() && !mailboxesWindow.isMinimized()) {
      if (process.platform === 'win32') {
        WaveboxWindow.all().forEach((win) => { win.minimize() })
      } else if (process.platform === 'darwin') {
        WaveboxWindow.all().forEach((win) => { win.hide() })
        app.hide()
      } else if (process.platform === 'linux') {
        WaveboxWindow.all().forEach((win) => { win.hide() })
      }
    } else {
      mailboxesWindow.show()
      mailboxesWindow.focus()
    }
  }

  /**
  * Toggles the wavebox mini menu
  */
  _handleToggleMini = () => {
    // (Thomas101) this is ripe for refactoring. The tray should be created
    // on the main thread
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    if (mailboxesWindow) {
      mailboxesWindow.__depricatedToggleTray()
    }
  }

  /**
  * Toggles the mailboxes window and switches to the mailbox at a given index
  * @param index: the index of the mailbox
  */
  _handleShowMailboxIndex = (index) => {
    const window = WaveboxWindow.getOfType(MailboxesWindow)
    if (window) {
      window.show()
      window.focus()
    }
    const mailboxId = accountStore.getState().mailboxIds()[index]
    if (mailboxId) {
      accountActions.changeActiveMailbox(mailboxId)
    }
  }

  _handleShowMailbox0 = () => { this._handleShowMailboxIndex(0) }
  _handleShowMailbox1 = () => { this._handleShowMailboxIndex(1) }
  _handleShowMailbox2 = () => { this._handleShowMailboxIndex(2) }
  _handleShowMailbox3 = () => { this._handleShowMailboxIndex(3) }
  _handleShowMailbox4 = () => { this._handleShowMailboxIndex(4) }
  _handleShowMailbox5 = () => { this._handleShowMailboxIndex(5) }
  _handleShowMailbox6 = () => { this._handleShowMailboxIndex(6) }
  _handleShowMailbox7 = () => { this._handleShowMailboxIndex(7) }
  _handleShowMailbox8 = () => { this._handleShowMailboxIndex(8) }
  _handleShowMailbox9 = () => { this._handleShowMailboxIndex(9) }
}

export default WaveboxAppGlobalShortcuts
