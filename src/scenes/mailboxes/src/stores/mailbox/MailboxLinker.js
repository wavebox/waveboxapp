import mailboxStore from './mailboxStore'
import settingsStore from '../settings/settingsStore'
import { WB_NEW_WINDOW } from 'shared/ipcEvents'
import { ipcRenderer, remote } from 'electron'

class MailboxLinker {
  /**
  * Opens an external window taking into account the users preferences
  * @param url: the url to open
  */
  static openExternalWindow (url) {
    remote.shell.openExternal(url, {
      activate: !settingsStore.getState().os.openLinksInBackground
    })
  }

  /**
  * Opens a content window for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param url: the url to open
  * @param options={}: the window event options
  */
  static openContentWindow (mailboxId, serviceType, url, options = {}) {
    // Generate the partition
    let partition = mailboxId
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (mailbox) {
      partition = mailbox.partition
    } else {
      partition = mailboxId
    }

    // Check what format options has come through in
    if (Array.isArray(options)) {
      options = {}
    }

    if (partition) {
      ipcRenderer.send(WB_NEW_WINDOW, {
        mailboxId: mailboxId,
        serviceType: serviceType,
        url: url,
        partition: `persist:${partition}`,
        windowPreferences: {
          ...options,
          webPreferences: undefined
        },
        webPreferences: {
          ...options.webPreferences,
          partition: `persist:${partition}`
        }
      })
    }
  }
}

export default MailboxLinker
