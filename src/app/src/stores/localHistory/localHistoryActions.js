import CoreLocalHistoryActions from 'shared/AltStores/LocalHistory/CoreLocalHistoryActions'
import depricatedPersistence from 'Storage/notifhistStorage'
import persistence from 'Storage/localHistoryStorage'
import alt from '../alt'
import { DownloadManager } from 'Download'

class LocalHistoryActions extends CoreLocalHistoryActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    const allData = persistence.allJSONItems()
    return {
      notifications: allData.notifications || depricatedPersistence.allJSONItems().notifications || [],
      downloads: allData.downloads || {},
      downloadsActive: {}
    }
  }

  /* **************************************************************************/
  // Download actions
  /* **************************************************************************/

  /**
  * Handles a download starting
  * @param id: the id of the download
  * @param download: the download
  */
  downloadStarted (id, download) { return { id, download } }

  /**
  * Handles a download updating
  * @param id: the id of the download
  * @param download: the download
  */
  downloadUpdated (id, download) { return { id, download } }

  /**
  * Handles a download finishing
  * @param id: the id of the download
  * @param download: the download
  */
  downloadFinished (id, download) { return { id, download } }

  /**
  * Handles a download failing
  * @param id: the id of the download
  * @param download: the download
  */
  downloadFailed (id, download) { return { id, download } }
}

const actions = alt.createActions(LocalHistoryActions)
DownloadManager.on('download-started', (evt, download) => actions.downloadStarted(download.id, download))
DownloadManager.on('download-updated', (evt, download) => actions.downloadUpdated(download.id, download))
DownloadManager.on('download-finished', (evt, download) => actions.downloadFinished(download.id, download))
DownloadManager.on('download-failed', (evt, download) => actions.downloadFailed(download.id, download))
export default actions
