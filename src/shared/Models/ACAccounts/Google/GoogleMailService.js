import CoreGoogleMailService from './CoreGoogleMailService'
import CoreACServiceCommand from '../CoreACServiceCommand'

// @Thomas101#9
class GoogleMailService extends CoreGoogleMailService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreGoogleMailService.SERVICE_TYPES.GOOGLE_MAIL }

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
  // Lifecycle
  /* **************************************************************************/

  constructor (...args) {
    super(...args)
    this.__commands__ = undefined
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://mail.google.com?ibxr=0' }

  /* **************************************************************************/
  // Properties: Mail
  /* **************************************************************************/

  get inboxType () {
    let v1InboxTypeVal = this.constructor.INBOX_TYPES.GMAIL_UNREAD
    const val = this._value_('inboxType', undefined)
    if (val !== undefined) {
      v1InboxTypeVal = val
    } else {
      const depricatedVal = this._value_('unreadMode', undefined)
      if (depricatedVal !== undefined) {
        const convertedVal = this.constructor.depricatedUnreadModeToInboxType(depricatedVal)
        if (convertedVal) {
          v1InboxTypeVal = convertedVal
        }
      }
    }

    switch (v1InboxTypeVal) {
      case this.constructor.INBOX_TYPES.GMAIL_DEFAULT_ATOM:
        return this.constructor.INBOX_TYPES.GMAIL_DEFAULT
      case this.constructor.INBOX_TYPES.GMAIL_IMPORTANT_ATOM:
        return this.constructor.INBOX_TYPES.GMAIL_IMPORTANT
      case this.constructor.INBOX_TYPES.GMAIL_UNREAD_ATOM:
        return this.constructor.INBOX_TYPES.GMAIL_UNREAD
      case this.constructor.INBOX_TYPES.GMAIL_STARRED_ATOM:
        return this.constructor.INBOX_TYPES.GMAIL_STARRED
      case this.constructor.INBOX_TYPES.GMAIL_PRIORITY_ATOM:
        return this.constructor.INBOX_TYPES.GMAIL_PRIORITY
      case this.constructor.INBOX_TYPES.GMAIL__ALL:
        return this.constructor.INBOX_TYPES.GMAIL_UNREAD
      default:
        return v1InboxTypeVal
    }
  }
  get supportedInboxTypes () {
    return new Set([
      this.constructor.INBOX_TYPES.GMAIL_DEFAULT,
      this.constructor.INBOX_TYPES.GMAIL_IMPORTANT,
      this.constructor.INBOX_TYPES.GMAIL_UNREAD,
      this.constructor.INBOX_TYPES.GMAIL_STARRED,
      this.constructor.INBOX_TYPES.GMAIL_PRIORITY
      /*
      this.constructor.INBOX_TYPES.GMAIL_DEFAULT_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_IMPORTANT_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_UNREAD_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_STARRED_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_PRIORITY_ATOM,
      this.constructor.INBOX_TYPES.GMAIL__ALL
      */
    ])
  }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RESET_URL }

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
}

export default GoogleMailService
