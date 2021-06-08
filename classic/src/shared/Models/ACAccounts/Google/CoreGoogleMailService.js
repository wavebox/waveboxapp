import CoreACService from '../CoreACService'
import CoreACServiceCommand from '../CoreACServiceCommand'

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
  GMAIL_DEFAULT: 'GMAIL_DEFAULT',
  GMAIL_IMPORTANT: 'GMAIL_IMPORTANT',
  GMAIL_UNREAD: 'GMAIL_UNREAD',
  GMAIL_STARRED: 'GMAIL_STARRED',
  GMAIL_PRIORITY: 'GMAIL_PRIORITY'
})
const DEPRICATED_INBOX_TYPES = Object.freeze({
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

class CoreGoogleMailService extends CoreACService {
  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * @override
  */
  static createJS (...args) {
    return {
      ...super.createJS(...args),

      // This is default Google offers on new accounts. Historically the default
      // set by Wavebox is UNREAD. Keep this historic default in the model, but
      // new accounts should match what Google sets with DEFAULT.
      inboxType: this.INBOX_TYPES.GMAIL_DEFAULT
    }
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Gmail' }
  static get humanizedTypeShort () { return 'Gmail' }
  static get humanizedLogos () {
    return [
      'google/logo_gmail_32px.png',
      'google/logo_gmail_48px.png',
      'google/logo_gmail_64px.png',
      'google/logo_gmail_96px.png',
      'google/logo_gmail_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(220, 75, 75)' }

  /* **************************************************************************/
  // Class: types
  /* **************************************************************************/

  static get INBOX_TYPES () { return INBOX_TYPES }

  static depricatedUnreadModeToInboxType (unreadMode) {
    switch (unreadMode) {
      case DEPRICATED_UNREAD_MODES.INBOX_ALL:
        return INBOX_TYPES.GMAIL_UNREAD
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD:
        return INBOX_TYPES.GMAIL_UNREAD
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return INBOX_TYPES.GMAIL_IMPORTANT
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return INBOX_TYPES.GMAIL_DEFAULT
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_UNBUNDLED:
        return INBOX_TYPES.GINBOX_UNBUNDLED
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_ATOM:
        return INBOX_TYPES.GMAIL_UNREAD
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM:
        return INBOX_TYPES.GMAIL_DEFAULT
      case DEPRICATED_UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM:
        return INBOX_TYPES.GMAIL_IMPORTANT
    }
  }

  static convertDepricatedInboxTypes (inboxType) {
    switch (inboxType) {
      case DEPRICATED_INBOX_TYPES.GMAIL_DEFAULT:
      case DEPRICATED_INBOX_TYPES.GMAIL_DEFAULT_ATOM:
        return INBOX_TYPES.GMAIL_DEFAULT
      case DEPRICATED_INBOX_TYPES.GMAIL_IMPORTANT:
      case DEPRICATED_INBOX_TYPES.GMAIL_IMPORTANT_ATOM:
        return INBOX_TYPES.GMAIL_IMPORTANT
      case DEPRICATED_INBOX_TYPES.GMAIL_UNREAD:
      case DEPRICATED_INBOX_TYPES.GMAIL_UNREAD_ATOM:
        return INBOX_TYPES.GMAIL_UNREAD
      case DEPRICATED_INBOX_TYPES.GMAIL_STARRED:
      case DEPRICATED_INBOX_TYPES.GMAIL_STARRED_ATOM:
        return INBOX_TYPES.GMAIL_STARRED
      case DEPRICATED_INBOX_TYPES.GMAIL_PRIORITY:
      case DEPRICATED_INBOX_TYPES.GMAIL_PRIORITY_ATOM:
        return INBOX_TYPES.GMAIL_PRIORITY
      default:
        return INBOX_TYPES.GMAIL_UNREAD
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (...args) {
    super(...args)
    this.__commands__ = undefined
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://mail.google.com' }

  /* **************************************************************************/
  // Properties: Sync
  /* **************************************************************************/

  get syncWatchFields () {
    return [ 'inboxType', 'syncInterval' ]
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

  get inboxType () {
    const val = this._value_('inboxType', undefined)
    if (val !== undefined) { return this.constructor.convertDepricatedInboxTypes(val) }

    const depricatedVal = this._value_('unreadMode', undefined)
    if (depricatedVal !== undefined) {
      const convertedVal = this.constructor.depricatedUnreadModeToInboxType(depricatedVal)
      if (convertedVal) { return convertedVal }
    }

    return this.constructor.INBOX_TYPES.GMAIL_UNREAD
  }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RESET_URL }
  get syncInterval () { return this._value_('syncInterval', 30000) }

  /* **************************************************************************/
  // Commands
  /* **************************************************************************/

  get commands () {
    if (this.__commands__ === undefined) {
      this.__commands__ = [
        new CoreACServiceCommand({
          modifier: '/',
          keyword: 'email',
          helper: 'user@wavebox.io My Subject',
          description: 'Start composing an email',
          js: String.raw`const getNewestComposeElements=function(){const a=Array.from(document.querySelectorAll("[name=\"subjectbox\"]")).slice(-1)[0];if(!a)return;const b=a.closest("[role=\"dialog\"]");if(!b)return;const c=b.querySelector("[g_editable=\"true\"][role=\"textbox\"]"),d=b.querySelector("[name=\"to\"]");return{subject:a,dialog:b,body:c,recipient:d}},populateNewestComposeWindow=function(a,b){const c=getNewestComposeElements();if(!c)return!1;let d;return a&&c.recipient&&(c.recipient.value=a,d=c.subject),b&&c.subject&&(c.subject.value=b,d=c.body),d&&setTimeout(()=>d.focus(),500),!0},composeMessage=function(a,b){const c=document.querySelector(".T-I.J-J5-Ji.T-I-KE.L3");if(c){const d=document.createEvent("MouseEvents");d.initEvent("mousedown",!0,!1),c.dispatchEvent(d);const e=document.createEvent("MouseEvents");return e.initEvent("mouseup",!0,!1),c.dispatchEvent(e),(a||b)&&setTimeout(()=>{const c=populateNewestComposeWindow(a,b);if(!c){let c=0;const d=setInterval(()=>{c++;const e=populateNewestComposeWindow(a,b);(e||20<c)&&clearInterval(d)},100)}},1),!0}},argComponents=args.trim().split(" "),to=argComponents[0],subject=argComponents.slice(1).join(" ");composeMessage(to,subject);`
        })
      ]
    }
    return this.__commands__
  }

  /* **************************************************************************/
  // Google Inbox conversion
  /* **************************************************************************/

  get wasGoogleInboxService () { return this._value_('wasGoogleInboxService', false) }
  get hasSeenGoogleInboxToGmailHelper () { return this._value_('hasSeenGoogleInboxToGmailHelper', false) }

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
