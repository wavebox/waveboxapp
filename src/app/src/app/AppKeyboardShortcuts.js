const {globalShortcut} = require('electron')

/*
 * KeyboardShortcuts registers additional keyboard shortcuts.
 * Note that most keyboard shortcuts are configured with the AppPrimaryMenu.
 */
class AppKeyboardShortcuts {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (selectors) {
    this._selectors = selectors
    this._shortcuts = []
  }

  /* ****************************************************************************/
  // Creating
  /* ****************************************************************************/

  /**
  * Generates the shortcut set
  * @param selector: the selectors to use
  * @return a map of shortcuts
  */
  generateShortcuts (selectors) {
    // Looking at depricating these completely. Maybe removing the module
    return new Map([
      // Mailboxes
      // ['CmdOrCtrl+{', selectors.prevMailbox],
      // ['CmdOrCtrl+}', selectors.nextMailbox],

      // Services
      // ['Alt+Shift+1', () => selectors.changeMailboxServiceToIndex(0)],
      // ['Alt+Shift+2', () => selectors.changeMailboxServiceToIndex(1)],
      // ['Alt+Shift+3', () => selectors.changeMailboxServiceToIndex(2)],
      // ['Alt+Shift+4', () => selectors.changeMailboxServiceToIndex(3)],
      // ['Alt+Shift+5', () => selectors.changeMailboxServiceToIndex(4)],
      // ['Alt+Shift+6', () => selectors.changeMailboxServiceToIndex(5)],
      // ['Alt+Shift+7', () => selectors.changeMailboxServiceToIndex(6)],
      // ['Alt+Shift+8', () => selectors.changeMailboxServiceToIndex(7)],
      // ['Alt+Shift+9', () => selectors.changeMailboxServiceToIndex(8)],

      // Misc
      // ['CmdOrCtrl+R', selectors.reload] // Microsoft seems to capture this for some reason. Placing it here has precidence
    ])
  }

  /**
   * Registers global keyboard shortcuts.
   */
  register () {
    this.unregister()
    this.generateShortcuts(this._selectors).forEach((callback, accelerator) => {
      globalShortcut.register(accelerator, callback)
      this._shortcuts.push(accelerator)
    })
  }

  /**
   * Unregisters any previously registered global keyboard shortcuts.
   */
  unregister () {
    this._shortcuts.forEach((accelerator) => {
      globalShortcut.unregister(accelerator)
    })
    this._shortcuts = []
  }
}

module.exports = AppKeyboardShortcuts
