const GoogleService = require('./GoogleService')
const addressparser = require('addressparser')

const ACCESS_MODES = Object.freeze({
  GINBOX: 'GINBOX',
  GMAIL: 'GMAIL'
})
const UNREAD_MODES = Object.freeze({
  INBOX_ALL: 'INBOX_ALL',
  INBOX_UNREAD: 'INBOX_UNREAD',
  INBOX_UNREAD_IMPORTANT: 'INBOX_UNREAD_IMPORTANT',
  INBOX_UNREAD_PERSONAL: 'INBOX_UNREAD_PERSONAL',
  INBOX_UNREAD_UNBUNDLED: 'INBOX_UNREAD_UNBUNDLED'
})

class GoogleDefaultService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.DEFAULT }
  static get ACCESS_MODES () { return ACCESS_MODES }
  static get UNREAD_MODES () { return UNREAD_MODES }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get accessMode () { return this._value_('accessMode', ACCESS_MODES.GINBOX) }
  get url () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return 'https://mail.google.com?ibxr=0'
      case ACCESS_MODES.GINBOX: return 'https://inbox.google.com'
    }
  }
  get unreadMode () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return this._value_('unreadMode', UNREAD_MODES.INBOX_UNREAD)
      case ACCESS_MODES.GINBOX: return this._value_('unreadMode', UNREAD_MODES.INBOX_UNREAD_UNBUNDLED)
    }
  }
  get supportedUnreadModes () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL:
        return new Set([
          UNREAD_MODES.INBOX_ALL,
          UNREAD_MODES.INBOX_UNREAD,
          UNREAD_MODES.INBOX_UNREAD_IMPORTANT,
          UNREAD_MODES.INBOX_UNREAD_PERSONAL
        ])
      case ACCESS_MODES.GINBOX:
        return new Set([
          UNREAD_MODES.INBOX_ALL,
          UNREAD_MODES.INBOX_UNREAD,
          UNREAD_MODES.INBOX_UNREAD_UNBUNDLED
        ])
    }
  }
  get sleepable () { return this._value_('sleepable', false) }
  get reloadBehaviour () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return this.constructor.RELOAD_BEHAVIOURS.RESET_URL
      case ACCESS_MODES.GINBOX: return this.constructor.RELOAD_BEHAVIOURS.RELOAD
    }
  }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return 'Gmail'
      case ACCESS_MODES.GINBOX: return 'Google Inbox'
    }
  }
  get humanizedLogos () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return [
        'images/google/logo_gmail_32px.png',
        'images/google/logo_gmail_48px.png',
        'images/google/logo_gmail_64px.png',
        'images/google/logo_gmail_128px.png'
      ]
      case ACCESS_MODES.GINBOX: return [
        'images/google/logo_ginbox_32px.png',
        'images/google/logo_ginbox_48px.png',
        'images/google/logo_ginbox_64px.png',
        'images/google/logo_ginbox_128px.png'
      ]
    }
  }
  get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }

  /* **************************************************************************/
  // Properties: Protocols & actions
  /* **************************************************************************/

  get supportedProtocols () { return new Set([GoogleService.PROTOCOL_TYPES.MAILTO]) }
  get supportsCompose () { return true }

  /* **************************************************************************/
  // Properties : Messages & unread info
  /* **************************************************************************/

  get historyId () { return this._value_('historyId') }
  get hasHistoryId () { return !!this.historyId }
  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadThreads () { return this._value_('unreadThreads', []) }
  get unreadThreadsIndexed () {
    return this.unreadThreads.reduce((acc, thread) => {
      acc[thread.id] = thread
      return acc
    }, {})
  }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get trayMessages () {
    return this.unreadThreads.map((thread) => {
      const message = thread.latestMessage
      return {
        id: `${thread.id}:${thread.historyId}`,
        text: `${addressparser(message.from)[0].name} : ${message.subject || 'No Subject'}`,
        date: parseInt(message.internalDate),
        data: {
          threadId: thread.id,
          messageId: message.id,
          mailboxId: this.parentId,
          serviceType: this.type
        }
      }
    })
  }
  get notifications () {
    return this.unreadThreads.map((thread) => {
      const message = thread.latestMessage
      return {
        id: `${thread.id}:${thread.historyId}`,
        title: message.subject || 'No Subject',
        titleFormat: 'text',
        body: [
          { content: message.from, format: 'text' },
          { content: message.snippet, format: 'html' }
        ],
        timestamp: parseInt(message.internalDate),
        data: {
          threadId: thread.id,
          messageId: message.id,
          mailboxId: this.parentId,
          serviceType: this.type
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
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition) {
    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition)
    if (superMode !== this.constructor.WINDOW_OPEN_MODES.DEFAULT) { return superMode }
    if (parsedUrl.hostname === 'mail.google.com') {
      if (parsedUrl.query.ui === '2') {
        switch (parsedUrl.query.view) {
          case 'pt': return this.constructor.WINDOW_OPEN_MODES.POPUP_CONTENT // Print message
          case 'btop': return this.constructor.WINDOW_OPEN_MODES.POPUP_CONTENT // Open google drive doc
        }
      }

      if (parsedUrl.query.view === 'om') { // View original. (Also from inbox.google.com)
        return this.constructor.WINDOW_OPEN_MODES.CONTENT
      }
    }

    return this.constructor.WINDOW_OPEN_MODES.DEFAULT
  }
}

module.exports = GoogleDefaultService
