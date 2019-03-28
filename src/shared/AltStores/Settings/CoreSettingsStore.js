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
    this._assets_ = new Map()
    Object.keys(SettingsIdent.SEGMENTS).forEach((k) => {
      this[SettingsIdent.SEGMENTS[k]] = null
      this.launched[SettingsIdent.SEGMENTS[k]] = null
    })

    /* ****************************************/
    // Getters
    /* ****************************************/

    /**
    * @return the base64 image set by the user for unread
    */
    this.getTrayUnreadImage = () => { return this._assets_.get(this.tray.unreadImageId) }

    /**
    * @return the base64 image set by the user for read
    */
    this.getTrayReadImage = () => { return this._assets_.get(this.tray.readImageId) }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleReloadDefaults: actions.RELOAD_DEFAULTS
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

  handleLoad ({ modelData, launchedModelData, defaults, assets }) {
    this.defaults = {
      ...this.defaults,
      ...defaults
    }

    Object.keys(SettingsIdent.SEGMENTS).forEach((k) => {
      const segment = SettingsIdent.SEGMENTS[k]
      this[segment] = this.modelize(segment, modelData[segment] || {})
      this.launched[segment] = this.modelize(segment, launchedModelData[segment] || {})
    })

    this._assets_ = Object.keys(assets).reduce((acc, k) => {
      acc.set(k, assets[k])
      return acc
    }, new Map())

    this.__isStoreLoaded__ = true
  }

  handleReloadDefaults ({ defaults }) {
    this.defaults = {
      ...this.defaults,
      ...defaults
    }
    Object.keys(SettingsIdent.SEGMENTS).forEach((k) => {
      const segment = SettingsIdent.SEGMENTS[k]
      this[segment] = this.modelize(segment, this[segment].cloneData())
    })
  }
}

export default CoreSettingsStore
