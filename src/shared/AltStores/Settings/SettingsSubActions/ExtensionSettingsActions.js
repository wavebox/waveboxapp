import { SettingsIdent } from '../../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'

class ExtensionSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.EXTENSION, actions)
  }

  /**
  * @param show: true to show browser actions in the toolbar
  */
  setShowBrowserActionsInToolbar (show) {
    this.dispatchUpdate('showBrowserActionsInToolbar', show)
  }

  /**
  * @param layout: the layout mode for the toolbar
  */
  setToolbarBrowserActionLayout (layout) {
    this.dispatchUpdate('toolbarBrowserActionLayout', layout)
  }
}

export default ExtensionSettingsActions
