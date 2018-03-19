import { ipcRenderer } from 'electron'
import { mailboxActions, mailboxDispatch } from 'stores/mailbox'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'

const privSignature = Symbol('privSignature')
const privTemplate = Symbol('privTemplate')

class TrayContextMenuUnreadRenderer {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privSignature] = ''
    this[privTemplate] = []
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get signature () { return this[privSignature] }
  get template () { return this[privTemplate] }

  /* **************************************************************************/
  // Updating
  /* **************************************************************************/

  /**
  * @param mailboxState: the new mailbox state
  */
  build (mailboxState) {
    const mailboxMenuItems = mailboxState.allMailboxes().map((mailbox) => {
      const trayMessages = mailboxState.mailboxTrayMessagesForUser(mailbox.id)
      const messageItemsSignature = trayMessages.map((message) => message.id).join(':')
      let messageItems = trayMessages.map((message) => {
        return {
          id: message.id,
          label: message.text,
          click: (e) => {
            ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
            mailboxActions.changeActive(message.data.mailboxId, message.data.serviceType)
            mailboxDispatch.openItem(message.data.mailboxId, message.data.serviceType, message.data)
          }
        }
      })

      messageItems.unshift(
        {
          label: 'Open Account',
          click: (e) => {
            ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
            mailboxActions.changeActive(mailbox.id)
          }
        },

        { type: 'separator' }
      )

      const unreadCount = mailboxState.mailboxUnreadCountForUser(mailbox.id)
      return {
        signature: messageItemsSignature,
        label: [
          unreadCount ? `(${unreadCount})` : undefined,
          mailbox.humanizedType === mailbox.displayName ? (
            mailbox.humanizedType
          ) : (
            `${mailbox.humanizedType} : ${mailbox.displayName || 'Untitled'}`
          )
        ].filter((item) => !!item).join(' '),
        submenu: messageItems.length === 2 ? [
          ...messageItems,
          { label: 'No messages', enabled: false }
        ] : messageItems
      }
    })

    this[privTemplate] = mailboxMenuItems
    this[privSignature] = mailboxMenuItems.map((m) => m.signature).join('|')
  }
}

export default TrayContextMenuUnreadRenderer
