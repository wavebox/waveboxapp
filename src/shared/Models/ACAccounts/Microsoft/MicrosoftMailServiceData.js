import CoreACServiceData from '../CoreACServiceData'

class MicrosoftMailServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadMessages () { return this._value_('unreadMessages', []) }
  get trayMessages () {
    return this.unreadMessages.map((message) => {
      const senderName = ((message.from || {}).emailAddress || {}).name
      return {
        id: message.id,
        text: `${senderName} : ${message.subject || 'No Subject'}`,
        extended: {
          title: message.subject || 'No Subject',
          subtitle: senderName,
          optSender: senderName,
          optAvatarText: (senderName || '')[0]
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
      const senderInfo = ((message.from || {}).emailAddress || {})
      const senderName = senderInfo.name
      const senderAddress = senderInfo.address
      return {
        id: message.id,
        title: message.subject || 'No Subject',
        titleFormat: 'text',
        body: [
          {
            content: `${senderName} <${senderAddress}>`,
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
