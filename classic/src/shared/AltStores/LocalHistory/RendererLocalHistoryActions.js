import CoreLocalHistoryActions from './CoreLocalHistoryActions'

class RendererLocalHistoryActions extends CoreLocalHistoryActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return this.remoteConnect()
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Handles remote setting a download
  * @param id the id of the download
  * @param downloadJS: the download
  * @param remove: an array of downloads to remove
  */
  remoteSetInactiveDownload (id, downloadJS, remove) {
    return { id, downloadJS, remove }
  }

  /**
  * Handles remote setting an active download
  * @param id the id of the download
  * @param downloadJS: the download
  */
  remoteSetActiveDownload (id, downloadJS) {
    return { id, downloadJS }
  }
}

export default RendererLocalHistoryActions
