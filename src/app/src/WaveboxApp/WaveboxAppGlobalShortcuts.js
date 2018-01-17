import {globalShortcut} from 'electron'
import { settingsStore } from 'stores/settings'
import WaveboxTrayBehaviour from './WaveboxTrayBehaviour'

const privConfig = Symbol('privConfig')
const privState = Symbol('privState')

class WaveboxAppGlobalShortcuts {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConfig] = [
      { selector: this._handleToggle, accelerator: '', acceleratorName: 'globalToggleApp' }
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
    WaveboxTrayBehaviour.toggleMailboxesWindow()
  }
}

export default WaveboxAppGlobalShortcuts
