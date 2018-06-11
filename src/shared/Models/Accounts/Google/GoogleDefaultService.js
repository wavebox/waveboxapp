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
  INBOX_UNREAD_UNBUNDLED: 'INBOX_UNREAD_UNBUNDLED',
  INBOX_UNREAD_ATOM: 'INBOX_UNREAD_ATOM',
  INBOX_UNREAD_PERSONAL_ATOM: 'INBOX_UNREAD_PERSONAL_ATOM',
  INBOX_UNREAD_IMPORTANT_ATOM: 'INBOX_UNREAD_IMPORTANT_ATOM'
})
const CUSTOM_UNREAD_COUNT_LABEL_FIELDS = Object.freeze([
  'messagesTotal',
  'messagesUnread',
  'threadsTotal',
  'threadsUnread'
])

class GoogleDefaultService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.DEFAULT }
  static get ACCESS_MODES () { return ACCESS_MODES }
  static get UNREAD_MODES () { return UNREAD_MODES }
  static get CUSTOM_UNREAD_COUNT_LABEL_FIELDS () { return CUSTOM_UNREAD_COUNT_LABEL_FIELDS }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'historyId',
      'unreadCount',
      'unreadThreads'
    ])
  }

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
          UNREAD_MODES.INBOX_UNREAD_PERSONAL,
          UNREAD_MODES.INBOX_UNREAD_ATOM,
          UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM,
          UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM
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
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return true }
  get supportsNativeNotifications () { return true }
  get supportsSyncWhenSleeping () { return true }

  /* **************************************************************************/
  // Properties: Custom search
  /* **************************************************************************/

  get customUnreadQuery () { return this._value_('customUnreadQuery', '').trim() }
  get hasCustomUnreadQuery () { return !!this.customUnreadQuery }
  get customUnreadLabelWatchString () { return this._value_('customUnreadLabelWatchString', '').trim() }
  get customUnreadLabelWatchArray () {
    return this.customUnreadLabelWatchString
      .split(',')
      .map((l) => l.trim().toUpperCase())
      .filter((l) => !!l)
  }
  get hasCustomUnreadLabelWatch () { return !!this.customUnreadLabelWatchString }

  get customUnreadCountFromLabel () { return this._value_('customUnreadCountFromLabel', false) }
  get customUnreadCountLabel () { return this._value_('customUnreadCountLabel', '').trim() }
  get hasCustomUnreadCountLabel () { return !!this.customUnreadCountLabel }
  get customUnreadCountLabelField () { return this._value_('customUnreadCountLabelField', 'threadsTotal') }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return 'Gmail'
      case ACCESS_MODES.GINBOX: return 'Google Inbox'
    }
  }
  get humanizedTypeShort () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return 'Gmail'
      case ACCESS_MODES.GINBOX: return 'Inbox'
    }
  }
  get humanizedLogos () {
    switch (this.accessMode) {
      case ACCESS_MODES.GMAIL: return [
        'google/logo_gmail_32px.png',
        'google/logo_gmail_48px.png',
        'google/logo_gmail_64px.png',
        'google/logo_gmail_96px.png',
        'google/logo_gmail_128px.png'
      ]
      case ACCESS_MODES.GINBOX: return [
        'google/logo_ginbox_32px.png',
        'google/logo_ginbox_48px.png',
        'google/logo_ginbox_64px.png',
        'google/logo_ginbox_96px.png',
        'google/logo_ginbox_128px.png'
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

  /**
  * Generates the open data for the message
  * @param thread: the thread to open
  * @param message: the message to open
  */
  _generateMessageOpenData (thread, message) {
    const data = {
      mailboxId: this.parentId,
      serviceType: this.type,
      threadId: thread.id,
      messageId: message.id
    }

    if (this.accessMode === ACCESS_MODES.GINBOX) {
      let fromAddress
      try { fromAddress = addressparser(message.from)[0].address } catch (ex) { /* no-op */ }
      let toAddress
      try { toAddress = addressparser(message.to)[0].address } catch (ex) { /* no-op */ }
      const afterDate = new Date(parseInt(message.internalDate))
      const beforeDate = new Date(parseInt(message.internalDate) + (1000 * 60 * 60 * 24))

      data.search = [
        fromAddress ? `from:"${fromAddress}"` : undefined,
        toAddress ? `to:${toAddress}` : undefined,
        message.subject ? `subject:"${message.subject}"` : undefined,
        `after:${afterDate.getFullYear()}/${afterDate.getMonth() + 1}/${afterDate.getDate()}`,
        `before:${beforeDate.getFullYear()}/${beforeDate.getMonth() + 1}/${beforeDate.getDate()}`
      ].filter((q) => !!q).join(' ')
    }

    return data
  }

  get trayMessages () {
    return this.unreadThreads.map((thread) => {
      const message = thread.latestMessage
      let fromName = ''
      if (message.from) {
        try {
          fromName = addressparser(message.from)[0].name || message.from
        } catch (ex) {
          fromName = message.from
        }
      }

      return {
        id: `${thread.id}:${thread.historyId}`,
        text: `${fromName} : ${message.subject || 'No Subject'}`,
        extended: {
          title: message.subject || 'No Subject',
          subtitle: fromName,
          optSender: fromName,
          optAvatarText: (fromName || '')[0]
        },
        date: parseInt(message.internalDate),
        data: this._generateMessageOpenData(thread, message)
      }
    })
  }
  get notifications () {
    return this.unreadThreads.map((thread) => {
      const message = thread.latestMessage
      return {
        id: `${thread.id}:${message.internalDate}`,
        title: message.subject || 'No Subject',
        titleFormat: 'text',
        body: [
          { content: message.from, format: 'text' },
          { content: message.snippet, format: 'html' }
        ],
        timestamp: parseInt(message.internalDate),
        data: this._generateMessageOpenData(thread, message)
      }
    })
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Looks to see if the input event should be prevented
  * @param input: the input info
  * @return true if the input should be prevented, false otherwise
  */
  shouldPreventInputEvent (input) {
    // Bushfix for issue #323
    if (process.platform === 'darwin') {
      if (input.meta && input.code === 'Comma') { return true }
    }
    return false
  }
}

module.exports = GoogleDefaultService
