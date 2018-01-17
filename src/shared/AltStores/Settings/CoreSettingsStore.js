import { SettingsIdent, SettingsFactory } from '../../Models/Settings'
import RemoteStore from '../RemoteStore'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltSettingsIdentifiers'

class CoreSettingsStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
    this.defaults = {}
    this.launched = {}
    Object.keys(SettingsIdent.SEGMENTS).forEach((k) => {
      this[SettingsIdent.SEGMENTS[k]] = null
      this.launched[SettingsIdent.SEGMENTS[k]] = null
    })

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Modelizes a settings section
  * @param segment: the segment type
  * @param data: the data to use
  */
  modelize (segment, data) {
    if (this.defaults[segment]) {
      return SettingsFactory.modelize(segment, ...[data, this.defaults[segment]])
    } else {
      return SettingsFactory.modelize(segment, data)
    }
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad ({ modelData, launchedModelData, defaults }) {
    this.defaults = {
      ...this.defaults,
      ...defaults
    }

    Object.keys(SettingsIdent.SEGMENTS).forEach((k) => {
      const segment = SettingsIdent.SEGMENTS[k]
      this[segment] = this.modelize(segment, modelData[segment] || {})
      this.launched[segment] = this.modelize(segment, launchedModelData[segment] || {})
    })
  }
}

export default CoreSettingsStore
