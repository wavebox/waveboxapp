import CoreACServiceData from '../CoreACServiceData'

class GoogleAlloServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadCountUpdateTime () { return this._value_('unreadCountUpdateTime', 0) }
  get trayMessages () {
    const count = this.unreadCount
    return count === 0 ? [] : [
      {
        id: `auto_${count}`,
        text: `${count} unseen Allo message${count > 1 ? 's' : ''}`,
        date: this.unreadCountUpdateTime,
        data: {}
      }
    ]
  }
}

export default GoogleAlloServiceData
