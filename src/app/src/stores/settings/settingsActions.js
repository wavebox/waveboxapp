import CoreSettingsActions from 'shared/AltStores/Settings/CoreSettingsActions'
import subActionsFactory from 'shared/AltStores/Settings/SettingsSubActions'
import alt from '../alt'
import persistence from 'Storage/settingStorage'
import SettingsDefaults from './SettingsDefaults'

class SettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    const allData = persistence.allJSONItems()
    return {
      modelData: allData,
      launchedModelData: allData,
      defaults: SettingsDefaults.generateAllDefaults()
    }
  }
}

const actions = alt.createActions(SettingsActions)
actions.sub = subActionsFactory(actions)

export default actions
