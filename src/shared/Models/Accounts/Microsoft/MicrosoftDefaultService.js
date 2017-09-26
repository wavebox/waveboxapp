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

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Mail' }
  static get humanizedLogos () {
    return [
      'images/microsoft/logo_mail_32px.png',
      'images/microsoft/logo_mail_48px.png',
      'images/microsoft/logo_mail_64px.png',
      'images/microsoft/logo_mail_128px.png'
    ]
  }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadCount () { return true }
  static get supportsTrayMessages () { return true }
  static get supportsSyncedDiffNotifications () { return true }
  static get supportsNativeNotifications () { return true }
  static get supportsSyncWhenSleeping () { return true }

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

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @param provisionalTargetUrl: the provisional target url that the user may be hovering over or have highlighted
  * @param parsedProvisionalTargetUrl: the provisional target parsed by nodejs url
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl) {
    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl)
    if (superMode !== this.constructor.WINDOW_OPEN_MODES.DEFAULT) { return superMode }
    if (parsedUrl.hostname === 'word-view.officeapps.live.com') { // Print PDF
      return this.constructor.WINDOW_OPEN_MODES.CONTENT
    }

    return this.constructor.WINDOW_OPEN_MODES.DEFAULT
  }
}

module.exports = MicrosoftDefaultService
