import CoreSettingsActions from 'shared/AltStores/Settings/CoreSettingsActions'
import subActionsFactory from 'shared/AltStores/Settings/SettingsSubactions'
import alt from '../alt'
import persistence from 'storage/settingStorage'
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

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * @overwrite
  */
  mergeSettingsModelChangeset (segment, changesetOrKey, undefinedOrVal) {
    if (typeof (changesetOrKey) === 'string') {
      const changeset = {}
      changeset[changesetOrKey] = undefinedOrVal
      return { id: segment, changeset: changeset }
    } else {
      return { id: segment, changeset: changesetOrKey }
    }
  }

  /**
  * @overwrite
  */
  toggleSettingsModelField (segment, key) {
    return { id: segment, key: key }
  }

  /**
  * @overwrite
  */
  removeSettingsModelField (segment, key) {
    return { id: segment, key: key }
  }

  /* **************************************************************************/
  // Updates: language
  /* **************************************************************************/

  /**
  * @overwrite
  */
  setSpellcheckerLanguage (lang) {
    return { lang }
  }

  /**
  * @overwrite
  */
  setSecondarySpellcheckerLanguage (lang) {
    return { lang }
  }

  /* **************************************************************************/
  // Updates: App
  /* **************************************************************************/

  /**
  * @overwrite
  */
  glueCurrentUpdateChannel (...args) {
    return {}
  }
}

const actions = alt.createActions(SettingsActions)
actions.sub = subActionsFactory(actions)

export default actions
