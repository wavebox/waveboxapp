const CoreService = require('../CoreService')

class GenericDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  static get humanizedType () { return 'Generic' }
  static get humanizedLogos () {
    return [
      'images/generic/logo_32px.png',
      'images/generic/logo_48px.png',
      'images/generic/logo_64px.png',
      'images/generic/logo_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return this.__data__.url || 'about:blank' }
  get sleepable () { return this._value_('sleepable', false) }
  get openWindowsExternally () { return this._value_('openWindowsExternally', false) }
}

module.exports = GenericDefaultService
