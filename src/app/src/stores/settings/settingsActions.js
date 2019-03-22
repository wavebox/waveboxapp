import CoreSettingsActions from 'shared/AltStores/Settings/CoreSettingsActions'
import subActionsFactory from 'shared/AltStores/Settings/SettingsSubActions'
import alt from '../alt'
import persistence from 'Storage/settingStorage'
import assetPersistence from 'Storage/settAssetStorage'
import SettingsDefaults from './SettingsDefaults'
import { SETT_ASSET_TIMESTAMP_PREFIX } from 'shared/constants'

class SettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    const allData = persistence.allJSONItems()
    const rawAssets = assetPersistence.allItems()

    return {
      modelData: allData,
      launchedModelData: allData,
      defaults: SettingsDefaults.generateAllDefaults(),
      assets: Object.keys(rawAssets).reduce((acc, id) => {
        // We don't load the timestamp data into the store at the moment,
        // it's only used by the storage bucket for incremental-diffs
        if (!id.startsWith(SETT_ASSET_TIMESTAMP_PREFIX)) {
          acc[id] = rawAssets[id]
        }
        return acc
      }, {})
    }
  }

  /**
  * @overwrite
  */
  reloadDefaults () {
    return { defaults: SettingsDefaults.generateAllDefaults() }
  }
}

const actions = alt.createActions(SettingsActions)
actions.sub = subActionsFactory(actions)

export default actions
