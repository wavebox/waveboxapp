const Model = require('./Model')
const MailboxTypes = require('./Accounts/MailboxTypes')
const MS_IN_DAY = (1000 * 60 * 60 * 24)
const PLANS = Object.freeze({
  FREE: 'free',
  TRIAL: 'trial',
  PRO: 'pro1'
})

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
    const val = this._value_('accountTypes', [MailboxTypes.GOOGLE])
    return val === null ? null : val
  }
  get hasAccountTypeRestriction () { return this.accountTypes !== null }

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

  /* **************************************************************************/
  // Properties: Permissions: Features
  /* **************************************************************************/

  get hasServices () { return this._value_('hasServices', false) }
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
}

module.exports = User
