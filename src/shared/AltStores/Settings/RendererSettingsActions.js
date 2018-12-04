import CoreSettingsActions from './CoreSettingsActions'

class RendererSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return this.remoteConnect()
  }

  /**
  * @overwrite
  */
  reloadDefaults (defaults) {
    if (!defaults) {
      throw new Error('defaults must be provided in the renderer thread')
    }
    return { defaults }
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Sets a model from a remote call
  * @param id: the id of the model
  * @param modelJS: the js of the model
  */
  remoteSetSettingsModel (id, modelJS) { return { id, modelJS } }
}

export default RendererSettingsActions
