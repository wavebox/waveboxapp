import CoreACServiceData from '../CoreACServiceData'

class MicrosoftMailServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadMessages () { return this._value_('unreadMessages', []) }
  get trayMessages () {
    return this.unreadMessages.map((message) => {
      return {
        id: message.id,
        text: `${message.from.emailAddress.name} : ${message.subject || 'No Subject'}`,
        extended: {
          title: message.subject || 'No Subject',
          subtitle: message.from.emailAddress.name,
          optSender: message.from.emailAddress.name,
          optAvatarText: (message.from.emailAddress.name || '')[0]
        },
        date: new Date(message.receivedDateTime).getTime(),
        data: {
          messageId: message.id,
          serviceId: this.parentId,
          webLink: message.webLink
        }
      }
    })
  }
  get notifications () {
    return this.unreadMessages.map((message) => {
      return {
        id: message.id,
        title: message.subject || 'No Subject',
        titleFormat: 'text',
        body: [
          {
            content: `${message.from.emailAddress.name} <${message.from.emailAddress.address}>`,
            format: 'text'
          },
          { content: message.bodyPreview, format: 'html' }
        ],
        timestamp: new Date(message.receivedDateTime).getTime(),
        data: {
          messageId: message.id,
          serviceId: this.parentId,
          webLink: message.webLink
        }
      }
    })
  }
}

export default MicrosoftMailServiceData
