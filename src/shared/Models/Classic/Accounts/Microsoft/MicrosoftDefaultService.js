const MicrosoftService = require('./MicrosoftService')

const UNREAD_MODES = Object.freeze({
  INBOX_UNREAD: 'INBOX_UNREAD',
  INBOX_FOCUSED_UNREAD: 'INBOX_FOCUSED_UNREAD'
})

class MicrosoftDefaultService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.DEFAULT }
  static get UNREAD_MODES () { return UNREAD_MODES }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'unreadCount',
      'unreadMessages'
    ])
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Mail' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_mail_32px.png',
      'microsoft/logo_mail_48px.png',
      'microsoft/logo_mail_64px.png',
      'microsoft/logo_mail_96px.png',
      'microsoft/logo_mail_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () {
    switch (this.accessMode) {
      case this.ACCESS_MODES.OUTLOOK: return 'https://outlook.live.com/owa/?authRedirect=true&nlp=1'
      case this.ACCESS_MODES.OFFICE365: return 'https://outlook.office365.com/owa/?authRedirect=true&nlp=1'
    }
  }

  get sleepable () { return this._value_('sleepable', false) }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return true }
  get supportsNativeNotifications () { return true }
  get supportsSyncWhenSleeping () { return true }

  /* **************************************************************************/
  // Properties : Messages & unread info
  /* **************************************************************************/

  get unreadMode () { return this._value_('unreadMode', UNREAD_MODES.INBOX_UNREAD) }
  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadMessages () { return this._value_('unreadMessages', []) }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

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
          mailboxId: this.parentId,
          serviceType: this.type,
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
          mailboxId: this.parentId,
          serviceType: this.type,
          webLink: message.webLink
        }
      }
    })
  }
}

module.exports = MicrosoftDefaultService
