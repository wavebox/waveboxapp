import { SettingsIdent } from '../../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'

class AcceleratorSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.ACCELERATORS, actions)
  }

  /* **************************************************************************/
  // Dispatch
  /* **************************************************************************/

  /**
  * Sets an accelerator
  * @param name: the name of the accelerator
  * @param signature: three element array signature
  */
  set (name, signature) { this.dispatchUpdate(name, signature) }

  /**
  * Restores an accelerator to its default value
  * @param name: the name of the accelerator
  */
  restoreDefault (name) {
    this.dispatchRemove(name)
  }
}

export default AcceleratorSettingsActions
