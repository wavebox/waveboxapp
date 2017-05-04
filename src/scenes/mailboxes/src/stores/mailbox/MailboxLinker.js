import mailboxStore from './mailboxStore'
import settingsStore from '../settings/settingsStore'
const {
  ipcRenderer,
  remote: { shell }
} = window.nativeRequire('electron')

class MailboxLinker {
  /**
  * Opens an external window taking into account the users preferences
  * @param url: the url to open
  */
  static openExternalWindow (url) {
    shell.openExternal(url, {
      activate: !settingsStore.getState().os.openLinksInBackground
    })
  }

  /**
  * Opens a content window for a mailbox
  * @param mailboxOrMailboxId: the id of the mailbox or the actual mailbox
  * @param url: the url to open
  * @param options={}: the window event options
  */
  static openContentWindow (mailboxOrMailboxId, url, options = {}) {
    // Generate the partition
    let partition = mailboxOrMailboxId
    if (typeof (mailboxOrMailboxId) === 'object') {
      partition = mailboxOrMailboxId.partition
    } else if (typeof (mailboxOrMailboxId) === 'string') {
      const mailbox = mailboxStore.getState().getMailbox(mailboxOrMailboxId)
      if (mailbox) {
        partition = mailbox.partition
      } else {
        partition = mailboxOrMailboxId
      }
    }

    // Check what format options has come through in
    if (Array.isArray(options)) {
      options = {}
    }

    if (partition) {
      ipcRenderer.send('new-window', {
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
