import CoreACService from '../CoreACService'
import SubclassNotImplementedError from '../SubclassNotImplementedError'

const DEPRICATED_UNREAD_MODES = Object.freeze({
  INBOX_ALL: 'INBOX_ALL',
  INBOX_UNREAD: 'INBOX_UNREAD',
  INBOX_UNREAD_IMPORTANT: 'INBOX_UNREAD_IMPORTANT',
  INBOX_UNREAD_PERSONAL: 'INBOX_UNREAD_PERSONAL',
  INBOX_UNREAD_UNBUNDLED: 'INBOX_UNREAD_UNBUNDLED',
  INBOX_UNREAD_ATOM: 'INBOX_UNREAD_ATOM',
  INBOX_UNREAD_PERSONAL_ATOM: 'INBOX_UNREAD_PERSONAL_ATOM',
  INBOX_UNREAD_IMPORTANT_ATOM: 'INBOX_UNREAD_IMPORTANT_ATOM'
})
const INBOX_TYPES = Object.freeze({
  // Gmail
  GMAIL_DEFAULT: 'GMAIL_DEFAULT',
  GMAIL_IMPORTANT: 'GMAIL_IMPORTANT',
  GMAIL_UNREAD: 'GMAIL_UNREAD',
  GMAIL_STARRED: 'GMAIL_STARRED',
  GMAIL_PRIORITY: 'GMAIL_PRIORITY',

  // Gmail via atom
  GMAIL_DEFAULT_ATOM: 'GMAIL_DEFAULT_ATOM',
  GMAIL_IMPORTANT_ATOM: 'GMAIL_IMPORTANT_ATOM',
  GMAIL_UNREAD_ATOM: 'GMAIL_UNREAD_ATOM',
  GMAIL_STARRED_ATOM: 'GMAIL_STARRED_ATOM',
  GMAIL_PRIORITY_ATOM: 'GMAIL_PRIORITY_ATOM',

  // Gmail Pseudo
  GMAIL__ALL: 'GMAIL__ALL',

  // Google Inbox (depricated)
  GINBOX_UNBUNDLED: 'GINBOX_UNBUNDLED'
})
const CUSTOM_UNREAD_COUNT_LABEL_FIELDS = Object.freeze([
  'messagesTotal',
  'messagesUnread',
  'threadsTotal',
  'threadsUnread'
])

class CoreGoogleMailService extends CoreACService {
  /* **************************************************************************/
  // Class: types
  /* **************************************************************************/

  static get INBOX_TYPES () { return INBOX_TYPES }
  static get CUSTOM_UNREAD_COUNT_LABEL_FIELDS () { return CUSTOM_UNREAD_COUNT_LABEL_FIELDS }

  static depricatedUnreadModeToInboxType (unreadMode) {
    switch (unreadMode) {
      case DEPRICATED_UNREAD_MODES.INBOX_ALL: return INBOX_TYPES.GMAIL__ALL
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD: return INBOX_TYPES.GMAIL_UNREAD
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_IMPORTANT: return INBOX_TYPES.GMAIL_IMPORTANT
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_PERSONAL: return INBOX_TYPES.GMAIL_DEFAULT
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_UNBUNDLED: return INBOX_TYPES.GINBOX_UNBUNDLED
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_ATOM: return INBOX_TYPES.GMAIL_UNREAD_ATOM
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM: return INBOX_TYPES.GMAIL_DEFAULT_ATOM
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM: return INBOX_TYPES.GMAIL_IMPORTANT_ATOM
    }
  }

  /* **************************************************************************/
  // Properties: Sync
  /* **************************************************************************/

  get syncWatchFields () {
    return [
      'inboxType',
      'customUnreadQuery',
      'customUnreadLabelWatchString',
      'customUnreadCountFromLabel',
      'customUnreadCountLabel',
      'customUnreadCountLabelField'
    ]
  }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return true }
  get supportsNativeNotifications () { return true }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return true }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return 'com.google' }

  /* **************************************************************************/
  // Properties: Mail
  /* **************************************************************************/

  get inboxType () { SubclassNotImplementedError('CoreGoogleMailServce.inboxType') }
  get supportedInboxTypes () { SubclassNotImplementedError('CoreGoogleMailServce.supportedInboxTypes') }
  get reloadBehaviour () { SubclassNotImplementedError('CoreGoogleMailServce.reloadBehaviour') }

  /* **************************************************************************/
  // Properties: Custom search
  /* **************************************************************************/

  get customUnreadQuery () { return this._value_('customUnreadQuery', '').trim() }
  get hasCustomUnreadQuery () { return false }
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
      if (input.meta && input.key === ',') { return true }
    }
    return false
  }
}

export default CoreGoogleMailService
