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
  */
  static openContentWindow (url, mailboxOrMailboxId) {
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

    if (partition) {
      ipcRenderer.send('new-window', {
        partition: 'persist:' + partition,
        url: url
      })
    }
  }
}

export default MailboxLinker
