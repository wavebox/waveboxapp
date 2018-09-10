import CoreACModel from './CoreACModel'

class ACProvisoService extends CoreACModel {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get serviceId () { return this._value_('serviceId') }
  get accessMode () { return this._value_('accessMode') }
  get expando () { return this._value_('expando', {}) }
  get serviceType () { return this._value_('serviceType') }
  get parentId () { return this._value_('parentId') }
}

export default ACProvisoService
