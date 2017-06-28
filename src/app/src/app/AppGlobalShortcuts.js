const {globalShortcut} = require('electron')
const settingStore = require('./stores/settingStore')

class AppGlobalShortcuts {
  /* ****************************************************************************/
  // Selectors
  /* ****************************************************************************/

  /**
  * Builds the selector index for the global shortcuts
  * @param windowManager: the window manager instance the callbacks can call into
  * @return the selectors map
  */
  static buildSelectors (windowManager) {
    return {
      toggle: () => {
        windowManager.toggleMailboxWindowVisibilityFromTray()
      }
    }
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (selectors) {
    this._config = [
      { selector: selectors.toggle, accelerator: '', acceleratorName: 'globalToggleApp' }
    ]
    this._boundHandleAcceleratorSettingsChanged = this.handleAcceleratorSettingsChanged.bind(this)
  }

  /**
  * Creates all the bindings
  */
  register () {
    this.updateGlobalAccelerators(settingStore.accelerators)
    settingStore.on('changed:accelerators', this._boundHandleAcceleratorSettingsChanged)
  }

  /**
  * Removes all bindings
  */
  unregister () {
    settingStore.removeListener('changed:accelerators', this._boundHandleAcceleratorSettingsChanged)
    this._config.forEach((config) => {
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
  handleAcceleratorSettingsChanged ({ next }) {
    this.updateGlobalAccelerators(next)
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
    this._config.forEach((config) => {
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
}

module.exports = AppGlobalShortcuts
