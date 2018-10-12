const Model = require('../Model')

class UserOrgWelcomeScreen extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get enabled () { return this._value_('ows::enabled', false) }
  get logo () { return this._value_('ows::logo', undefined) }
  get hasLogo () { return !!this.logo }
  get welcomeTextHeading () { return this._value_('ows::welcomeTextHeading', 'Welcome to Wavebox') }
  get welcomeTextSubheading () { return this._value_('ows::welcomeTextSubheading', 'Choose your profile:') }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  get profiles () { return this._value_('ows::profiles', []) }
  get profileButtonVariant () { return this._value_('ows::profileButtonVariant', 'outlined') }
  get profileButtonColor () { return this._value_('ows::profileButtonColor', 'primary') }

  /* **************************************************************************/
  // Add button
  /* **************************************************************************/

  get addAppButtonVisible () { return this._value_('ows::addAppButtonVisible', true) }
  get addAppButtonVariant () { return this._value_('ows::addAppButtonVariant', 'outlined') }
  get addAppButtonColor () { return this._value_('ows::addAppButtonColor', 'primary') }
  get addAppButtonText () { return this._value_('ows::addAppButtonText', 'Add your first App') }

  /* **************************************************************************/
  // Theme
  /* **************************************************************************/

  get theme () { return this._value_('ows::theme', {}) }
}

module.exports = UserOrgWelcomeScreen
