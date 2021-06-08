import CoreACServiceData from '../CoreACServiceData'

class GoogleCalendarServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get hasUnreadActivity () { return this._value_('lastUnseenNotificationTime', null) !== null }

  get mergeChangesetOnActive () {
    return { lastUnseenNotificationTime: null }
  }
}

export default GoogleCalendarServiceData
