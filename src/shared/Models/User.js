const Model = require('./Model')
const MailboxTypes = require('./Accounts/MailboxTypes')

class User extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get plan () { return this._value_('plan', 'unknown') }
  get billingUrl () { return this._value_('billingUrl', undefined) }
  get proUrl () { return this._value_('proUrl', undefined) }
  get clientSecret () { return this._value_('clientSecret', undefined) }
  get accountMessageUrl () { return this._value_('messageUrl', undefined) }
  get showPlansInSidebar () { return this._value_('showPlansInSidebar', true) }

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
}

module.exports = User
