import CoreACService from '../CoreACService'
import SubclassNotImplementedError from '../SubclassNotImplementedError'

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

class CoreGoogleMailService extends CoreACService {
  /* **************************************************************************/
  // Class: types
  /* **************************************************************************/

  static get UNREAD_MODES () { return UNREAD_MODES }
  static get CUSTOM_UNREAD_COUNT_LABEL_FIELDS () { return CUSTOM_UNREAD_COUNT_LABEL_FIELDS }

  /* **************************************************************************/
  // Properties: Sync
  /* **************************************************************************/

  get syncWatchFields () {
    return [
      'unreadMode',
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

  get unreadMode () { SubclassNotImplementedError('CoreGoogleMailServce.unreadMode') }
  get supportedUnreadModes () { SubclassNotImplementedError('CoreGoogleMailServce.supportedUnreadModes') }
  get reloadBehaviour () { SubclassNotImplementedError('CoreGoogleMailServce.reloadBehaviour') }

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

export default CoreGoogleMailService
