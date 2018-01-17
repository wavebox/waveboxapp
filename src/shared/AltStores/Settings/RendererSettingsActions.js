import CoreSettingsActions from './CoreSettingsActions'

class RendererSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () { return this.remoteConnect() }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * @overwrite
  */
  mergeSettingsModelChangeset (...args) {
    return this.remoteDispatch('mergeSettingsModelChangeset', args)
  }

  /**
  * @overwrite
  */
  toggleSettingsModelField (...args) {
    return this.remoteDispatch('toggleSettingsModelField', args)
  }

  /**
  * Sets a model from a remote call
  * @param id: the id of the model
  * @param modelJS: the js of the model
  */
  remoteSetSettingsModel (id, modelJS) { return { id, modelJS } }

  /* **************************************************************************/
  // Updates: language
  /* **************************************************************************/

  /**
  * @overwrite
  */
  setSpellcheckerLanguage (...args) {
    return this.remoteDispatch('setSpellcheckerLanguage', args)
  }

  /**
  * @overwrite
  */
  setSecondarySpellcheckerLanguage (...args) {
    return this.remoteDispatch('setSecondarySpellcheckerLanguage', args)
  }

  /* **************************************************************************/
  // Updates: App
  /* **************************************************************************/

  /**
  * @overwrite
  */
  setHasSeenAppWizard (...args) {
    return this.remoteDispatch('setHasSeenAppWizard', args)
  }

  /**
  * @overwrite
  */
  glueCurrentUpdateChannel (...args) {
    return this.remoteDispatch('glueCurrentUpdateChannel', args)
  }
}

export default RendererSettingsActions
