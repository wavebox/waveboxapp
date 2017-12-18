import {globalShortcut} from 'electron'
import settingStore from 'stores/settingStore'
import WaveboxTrayBehaviour from './WaveboxTrayBehaviour'

const privConfig = Symbol('privConfig')

class WaveboxAppGlobalShortcuts {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConfig] = [
      { selector: this._handleToggle, accelerator: '', acceleratorName: 'globalToggleApp' }
    ]
  }

  /**
  * Creates all the bindings
  */
  register () {
    this.updateGlobalAccelerators(settingStore.accelerators)
    settingStore.on('changed:accelerators', this.handleAcceleratorSettingsChanged)
  }

  /**
  * Removes all bindings
  */
  unregister () {
    settingStore.removeListener('changed:accelerators', this.handleAcceleratorSettingsChanged)
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
  handleAcceleratorSettingsChanged = ({ next }) => {
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
    WaveboxTrayBehaviour.toggleMailboxesWindow()
  }
}

export default WaveboxAppGlobalShortcuts
