import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import {
  WBRPC_OPEN_RECENT_LINK,
  WBRPC_OPEN_READING_QUEUE_LINK,
  WBRPC_GET_UPDATER_CONFIG,
  WBRPC_SYNC_GET_GUEST_PRELOAD_CONFIG,
  WBRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG,
  WBRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG,
  WBRPC_OPEN_EXTERNAL
} from '../WBRPCEvents'

class WBRPCWavebox {
  /* ****************************************************************************/
  // Preload
  /* ****************************************************************************/

  /**
  * Gets the guest preload config synchronously
  * @return the preload config
  */
  getGuestPreloadConfigSync () {
    return ipcRenderer.sendSync(WBRPC_SYNC_GET_GUEST_PRELOAD_CONFIG, window.location.href)
  }

  /**
  * Gets the extension contentscript preload config synchronously
  * @param extensionId: the extension id
  * @return the cs preload config
  */
  getExtensionContentScriptPreloadConfigSync (extensionId) {
    return ipcRenderer.sendSync(WBRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG, extensionId)
  }

  /**
  * Gets the extension hosted preload config synchronously
  * @param extensionId: the extension id
  * @return the hosted preload config
  */
  getExtensionHostedPreloadConfigSync (extensionId) {
    return ipcRenderer.sendSync(WBRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG, extensionId)
  }

  /* ****************************************************************************/
  // Links
  /* ****************************************************************************/

  /**
  * Opens a recent link
  * @param serviceId: the service id the link is for
  * @param recentItem: the recent item config
  */
  openRecentLink (serviceId, recentItem) {
    ipcRenderer.send(WBRPC_OPEN_RECENT_LINK, serviceId, recentItem)
  }

  /**
  * Opens a reading queue link
  * @param serviceId: the service id the link is for
  * @param readingItem: the reading item config
  */
  openReadingQueueLink (serviceId, readingItem) {
    ipcRenderer.send(WBRPC_OPEN_READING_QUEUE_LINK, serviceId, readingItem)
  }

  /**
  * Opens a link in an external handler
  * @param url: the url to open
  * @param options: additional options to send
  */
  openExternal (url, options) {
    ipcRenderer.send(WBRPC_OPEN_EXTERNAL, url, options)
  }

  /* ****************************************************************************/
  // Updates
  /* ****************************************************************************/

  /**
  * Fetches the updater config
  * @return promise
  */
  fetchUpdaterConfig () {
    return new Promise((resolve, reject) => {
      const ret = `${WBRPC_GET_UPDATER_CONFIG}_${uuid.v4()}`
      let hasReturned = false
      const timeout = setTimeout(() => {
        if (hasReturned) { return }
        hasReturned = true
        reject(new Error('Timeout'))
      }, 2000)
      ipcRenderer.once(ret, (evt, config) => {
        if (hasReturned) { return }
        hasReturned = true
        clearTimeout(timeout)
        resolve(config)
      })
      ipcRenderer.send(WBRPC_GET_UPDATER_CONFIG, ret)
    })
  }
}

export default WBRPCWavebox
