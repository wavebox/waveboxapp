import CoreSettingsStore from 'shared/AltStores/Settings/CoreSettingsStore'
import persistence from 'Storage/settingStorage'
import assetPersistence from 'Storage/settAssetStorage'
import alt from '../alt'
import { STORE_NAME } from 'shared/AltStores/Settings/AltSettingsIdentifiers'
import { SettingsIdent, AppSettings } from 'shared/Models/Settings'
import actions from './settingsActions'
import dictionaries from 'shared/SpellcheckProvider/dictionaries.js'
import pkg from 'package.json'
import { systemPreferences } from 'electron'
import uuid from 'uuid'
import { SETT_ASSET_TIMESTAMP_PREFIX } from 'shared/constants'

const privCachedLaunchDataJS = Symbol('privCachedLaunchDataJS')

class SettingsStore extends CoreSettingsStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this[privCachedLaunchDataJS] = null

    /* ****************************************/
    // Render preferences
    /* ****************************************/

    /**
    * Gets a js object with all the launch settings
    * @return the launch settings as plain js
    */
    this.launchSettingsJS = () => {
      if (this[privCachedLaunchDataJS] === null) {
        this[privCachedLaunchDataJS] = Object.keys(this.launched).reduce((acc, segment) => {
          acc[segment] = this.launched[segment].cloneData()
          return acc
        }, {})
      }
      return this[privCachedLaunchDataJS]
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
      handleMergeSettingsModelChangeset: actions.MERGE_SETTINGS_MODEL_CHANGESET,
      handleToggleSettingsModelField: actions.TOGGLE_SETTINGS_MODEL_FIELD,
      handleRemoveSettingsModelField: actions.REMOVE_SETTINGS_MODEL_FIELD,

      handleSetSpellcheckerLanguage: actions.SET_SPELLCHECKER_LANGUAGE,
      handleSetSecondarySpellcheckerLanguage: actions.SET_SECONDARY_SPELLCHECKER_LANGUAGE,

      handleGlueCurrentUpdateChannel: actions.GLUE_CURRENT_UPDATE_CHANNEL,

      handleSetCustomLinkProvider: actions.SET_CUSTOM_LINK_PROVIDER,
      handleRemoveCustomLinkProvider: actions.REMOVE_CUSTOM_LINK_PROVIDER,

      handleSetTrayUnreadImage: actions.SET_TRAY_UNREAD_IMAGE,
      handleSetTrayReadImage: actions.SET_TRAY_READ_IMAGE
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Saves the settings
  * @param id: the id of the settings
  * @param modelJS: the js for the model
  */
  saveSettingsModel (id, modelJS) {
    this[id] = this.modelize(id, modelJS)
    persistence.setJSONItem(id, modelJS)
    this.dispatchToRemote('remoteSetSettingsModel', [id, modelJS])
  }

  /**
  * Saves an avatar
  * @param id: the id of the avatar
  * @param b64Asset: the asset or undefined/null
  */
  saveAsset (id, b64Asset) {
    if (b64Asset) {
      if (this._assets_.get(id) === b64Asset) { return }
      this._assets_.set(id, b64Asset)
      assetPersistence.setItem(id, b64Asset)
      assetPersistence.setItem(`${SETT_ASSET_TIMESTAMP_PREFIX}${id}`, new Date().getTime())
      this.dispatchToRemote('remoteSetAsset', [id, b64Asset])
    } else {
      if (!this._assets_.has(id)) { return }
      this._assets_.delete(id)
      assetPersistence.removeItem(id)
      assetPersistence.removeItem(`${SETT_ASSET_TIMESTAMP_PREFIX}${id}`)
      this.dispatchToRemote('remoteSetAsset', [id, null])
    }
  }

  /* **************************************************************************/
  // Overwrites
  /* **************************************************************************/

  /**
  * Overwrite
  */
  handleLoad (payload) {
    super.handleLoad(payload)

    if (process.platform === 'darwin') {
      systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
        () => {
          actions.reloadDefaults()
        }
      )
    }
  }

  /**
  * Overwrite
  */
  handleReloadDefaults (payload) {
    super.handleReloadDefaults(payload)
    this.dispatchToRemote('reloadDefaults', [payload.defaults])
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      modelData: Object.keys(SettingsIdent.SEGMENTS).reduce((acc, k) => {
        const segment = SettingsIdent.SEGMENTS[k]
        acc[segment] = this[segment].cloneData()
        return acc
      }, {}),
      launchedModelData: this.launchSettingsJS(),
      defaults: this.defaults,
      assets: Array.from(this._assets_.keys()).reduce((acc, k) => {
        acc[k] = this._assets_.get(k)
        return acc
      }, {})
    }
  }

  /* **************************************************************************/
  // Model updating
  /* **************************************************************************/

  handleMergeSettingsModelChangeset ({ id, changeset }) {
    this.saveSettingsModel(id, this[id].changeData(changeset))
  }

  handleToggleSettingsModelField ({ id, key }) {
    const modelJS = this[id].cloneData()
    modelJS[key] = !this[id][key]
    this.saveSettingsModel(id, modelJS)
  }

  handleRemoveSettingsModelField ({ id, key }) {
    this.saveSettingsModel(id, this[id].changeData({ [key]: undefined }))
  }

  /* **************************************************************************/
  // Updating : Language
  /* **************************************************************************/

  handleSetSpellcheckerLanguage ({ lang }) {
    const primaryInfo = dictionaries[lang]
    const secondaryInfo = (dictionaries[this.language.secondarySpellcheckerLanguage] || {})

    if (primaryInfo.charset !== secondaryInfo.charset) {
      this.saveSettingsModel(SettingsIdent.SEGMENTS.LANGUAGE, this.language.changeData({
        spellcheckerLanguage: lang,
        secondarySpellcheckerLanguage: null
      }))
    } else {
      this.saveSettingsModel(SettingsIdent.SEGMENTS.LANGUAGE, this.language.changeData({
        spellcheckerLanguage: lang
      }))
    }
  }

  handleSetSecondarySpellcheckerLanguage ({ lang }) {
    if (!lang) {
      this.saveSettingsModel(SettingsIdent.SEGMENTS.LANGUAGE, this.language.changeData({
        secondarySpellcheckerLanguage: null
      }))
    } else {
      const primaryInfo = (dictionaries[this.language.spellcheckerLanguage] || {})
      const secondaryInfo = (dictionaries[lang] || {})
      if (primaryInfo.charset === secondaryInfo.charset) {
        this.saveSettingsModel(SettingsIdent.SEGMENTS.LANGUAGE, this.language.changeData({
          secondarySpellcheckerLanguage: lang
        }))
      }
    }
  }

  /* **************************************************************************/
  // Updating : App
  /* **************************************************************************/

  handleGlueCurrentUpdateChannel () {
    this.preventDefault()
    if (!this.app.hasSetUpdateChannel && pkg.releaseChannel !== AppSettings.UPDATE_CHANNELS.STABLE) {
      this.saveSettingsModel(SettingsIdent.SEGMENTS.APP, this.app.changeData({
        updateChannel: pkg.releaseChannel
      }))
    }
  }

  /* **************************************************************************/
  // Updating : OS
  /* **************************************************************************/

  handleSetCustomLinkProvider ({ providerId, provider }) {
    providerId = providerId || uuid.v4()
    this.saveSettingsModel(SettingsIdent.SEGMENTS.OS, this.os.changeDataWithChangeset({
      customLinkProviders: {
        [providerId]: provider
      }
    }))
  }

  handleRemoveCustomLinkProvider ({ providerId }) {
    if (!providerId) { this.preventDefault(); return }
    this.saveSettingsModel(SettingsIdent.SEGMENTS.OS, this.os.changeDataWithChangeset({
      customLinkProviders: {
        [providerId]: undefined
      }
    }))
  }

  /* **************************************************************************/
  // Updating : Tray
  /* **************************************************************************/

  /**
  * Handles the dispatch of changing a tray image
  * @param b64Image: the new base 64 image
  * @param propKey: the key for the model
  * @param dataKey: the key for the underlying json data
  */
  _handleChangeTrayImage (b64Image, propKey, dataKey) {
    const prevAssetId = this.tray[propKey]
    if (b64Image) { // Set
      if (prevAssetId && this._assets_.get(prevAssetId) === b64Image) {
        this.preventDefault(); return
      }

      const assetId = uuid.v4()
      this.saveAsset(assetId, b64Image)
      this.saveSettingsModel(SettingsIdent.SEGMENTS.TRAY, this.tray.changeData({ [dataKey]: assetId }))
      if (prevAssetId) {
        this.saveAsset(prevAssetId, null)
      }
    } else { // Remove
      if (!prevAssetId) { this.preventDefault(); return }
      this.saveSettingsModel(SettingsIdent.SEGMENTS.TRAY, this.tray.changeData({ [dataKey]: undefined }))
      this.saveAsset(prevAssetId, null)
    }
  }

  handleSetTrayUnreadImage ({ b64Image }) {
    this._handleChangeTrayImage(b64Image, 'unreadImageId', 'unreadImageId')
  }

  handleSetTrayReadImage ({ b64Image }) {
    this._handleChangeTrayImage(b64Image, 'readImageId', 'readImageId')
  }
}

export default alt.createStore(SettingsStore, STORE_NAME)
