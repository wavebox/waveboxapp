import { ipcRenderer } from 'electron'
import { accountActions, accountDispatch } from 'stores/account'
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
  * @param accountState: the new account state
  */
  build (accountState) {
    const mailboxMenuItems = accountState.allMailboxes().map((mailbox) => {
      const trayMessages = accountState.userTrayMessagesForMailbox(mailbox.id)
      const messageItemsSignature = trayMessages.map((message) => message.id).join(':')
      let messageItems = trayMessages.map((message) => {
        return {
          id: message.id,
          label: message.text,
          click: (e) => {
            ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
            accountActions.changeActiveService(message.data.serviceId)
            accountDispatch.openItem(message.data.serviceId, message.data)
          }
        }
      })

      messageItems.unshift(
        {
          label: 'Open Account',
          click: (e) => {
            ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
            accountActions.changeActiveMailbox(mailbox.id)
          }
        },

        { type: 'separator' }
      )

      const unreadCount = accountState.userUnreadCountForMailbox(mailbox.id)
      return {
        signature: messageItemsSignature,
        label: [
          unreadCount ? `(${unreadCount})` : undefined,
          accountState.resolvedMailboxDisplayName(mailbox.id)
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
