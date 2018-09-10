const Model = require('../../Model')

class CoreServiceGuestConfig extends Model {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hasUnreadActivity () {
    return this._valueOfType_('::guestConfig:hasUnreadActivity', 'boolean', false)
  }
  get unreadCount () {
    return parseInt(this._valueOfType_('::guestConfig:unreadCount', 'number', 0))
  }
  get trayMessages () {
    return this._valueOfType_('::guestConfig:trayMessages', 'array', [])
  }
}

module.exports = CoreServiceGuestConfig
