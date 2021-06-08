import CoreACModel from './CoreACModel'
import ACMailbox from './ACMailbox'

class ACTemplatedAccount extends CoreACModel {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get templateType () { return this._value_('templateType') }
  get accessMode () { return this._value_('accessMode') }
  get expando () { return this._value_('expando', {}) }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get color () { return this._value_('color') }
  get hasColor () { return !!this.color }
  get displayName () { return this._value_('displayName') }
  get hasDisplayName () { return !!this.displayName }

  /* **************************************************************************/
  // Properties: Services
  /* **************************************************************************/

  get services () { return this._value_('services', []) }
  get servicesUILocation () { return this._value_('servicesUILocation', ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START) }
}

export default ACTemplatedAccount
