const Model = require('./Model')
const SERVICE_TYPES = require('./ACAccounts/ServiceTypes').default

const MS_IN_DAY = (1000 * 60 * 60 * 24)
const PLANS = Object.freeze({
  FREE: 'free',
  TRIAL: 'trial',
  PRO: 'pro1'
})

// Prior to 3.14.8 we would send mailbox types, migrate these to the equivalent service types
const DEPRICATED_TYPE_MAPPING = {
  'GOOGLE': [ SERVICE_TYPES.GOOGLE_MAIL, SERVICE_TYPES.GOOGLE_INBOX ],
  'MICROSOFT': [ SERVICE_TYPES.MICROSOFT_MAIL ],
  'TRELLO': [ SERVICE_TYPES.TRELLO ],
  'SLACK': [ SERVICE_TYPES.SLACK ],
  'GENERIC': [ SERVICE_TYPES.GENERIC ],
  'CONTAINER': [ SERVICE_TYPES.CONTAINER ]
}

class User extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get PLANS () { return PLANS }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the user data
  * @param dataEpoch: the time the data was received from the server
  */
  constructor (data, dataEpoch) {
    super(data)
    this.__dataEpoch__ = dataEpoch
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get plan () { return this._value_('plan', 'unknown') }
  get billingUrl () { return this._value_('billingUrl', undefined) }
  get proUrl () { return this._value_('proUrl', undefined) }
  get clientSecret () { return this._value_('clientSecret', undefined) }
  get accountMessageUrl () { return this._value_('messageUrl', undefined) }
  get showPlansInSidebar () { return this._value_('showPlansInSidebar', true) }
  get sidebarPlanExpiryMillis () { return this._value_('sidebarPlanExpiry', 0) }
  get sidebarPlanExpiryDays () { return Math.round(this.sidebarPlanExpiryMillis / (MS_IN_DAY)) }

  /* **************************************************************************/
  // Properties: Permissions: Accounts
  /* **************************************************************************/

  get accountLimit () {
    const val = this._value_('accountLimit', 2)
    return val === null ? Infinity : val
  }
  get hasAccountLimit () { return this.accountLimit !== Infinity }

  get accountTypes () {
    const val = this.classicAccountTypes
    return val === null ? null : val.reduce((acc, t) => acc.concat(DEPRICATED_TYPE_MAPPING[t] || t), [])
  }
  get classicAccountTypes () { return this._value_('accountTypes', ['GOOGLE']) }
  get hasAccountTypeRestriction () { return this.classicAccountTypes !== null }

  /**
  * @param type: the type of account to check
  * @return true if the user is allowed the provided account
  */
  hasAccountsOfType (type) {
    if (this.hasAccountTypeRestriction) {
      return !!this.accountTypes.find((t) => t === type)
    } else {
      return true
    }
  }

  /**
  * @param currentCount: the current count of services
  * @return true if the user has reached their account limit, false otherwise
  */
  hasReachedAccountLimit (currentCount) {
    if (this.hasAccountLimit) {
      return currentCount >= this.this.accountLimit
    } else {
      return false
    }
  }

  /* **************************************************************************/
  // Properties: Permissions: Features
  /* **************************************************************************/

  get hasSleepable () { return this._value_('hasSleepable', false) }

  /* **************************************************************************/
  // Properties: Permissions: Extensions
  /* **************************************************************************/

  get extensionLevels () { return this._value_('extensionLevels', []) }

  /**
  * @param levels: the extension levels
  * @return true if the user is allowed the extension
  */
  hasExtensionWithLevel (levels) {
    if (levels === null) { return true }
    const allowed = new Set(this.extensionLevels)
    return levels.findIndex((l) => allowed.has(l)) !== -1
  }

  /* **************************************************************************/
  // Properties: User
  /* **************************************************************************/

  get userEmail () { return this._value_('userEmail', null) }
  get hasUserEmail () { return !!this.userEmail }
  get isLoggedIn () { return this.hasUserEmail }

  /* **************************************************************************/
  // Properties: Privacy
  /* **************************************************************************/

  get privacyMessage () {
    const privacyMessage = this._value_('privacyMessage', undefined)
    if (privacyMessage && typeof (privacyMessage) === 'object' && Object.keys(privacyMessage).length) {
      return privacyMessage
    } else {
      return undefined
    }
  }
  get hasPrivacyMessage () { return !!this.privacyMessage }
  get analyticsEnabled () {
    const privacy = this._value_('privacy', {})
    return privacy.enable_analytics === undefined ? false : privacy.enable_analytics
  }

  /* **************************************************************************/
  // Properties: Profiles
  /* **************************************************************************/

  get enableProfileSync () { return this._value_('enableProfileSync', false) }
  get hasProfiles () { return this._value_('hasProfiles', false) }
}

module.exports = User
