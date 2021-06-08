import accountStore from './accountStore'
import settingsStore from '../settings/settingsStore'
import { WB_NEW_WINDOW } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import WBRPCRenderer from 'shared/WBRPCRenderer'

class AccountLinker {
  /**
  * Opens an external window taking into account the users preferences
  * @param url: the url to open
  */
  static openExternalWindow (url) {
    WBRPCRenderer.wavebox.openExternal(url, {
      activate: !settingsStore.getState().os.openLinksInBackground
    })
  }

  /**
  * Opens a content window for a mailbox
  * @param serviceId: the id of the service
  * @param url: the url to open
  * @param options={}: the window event options
  */
  static openContentWindow (serviceId, url, options = {}) {
    // Generate the partition
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return }

    // Check what format options has come through in
    if (Array.isArray(options)) {
      options = {}
    }

    ipcRenderer.send(WB_NEW_WINDOW, {
      mailboxId: service.parentId,
      serviceId: serviceId,
      url: url,
      partition: service.partitionId,
      windowPreferences: {
        ...options,
        webPreferences: undefined
      },
      webPreferences: {
        ...options.webPreferences,
        partition: service.partitionId
      }
    })
  }
}

export default AccountLinker
