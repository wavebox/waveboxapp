import CoreACServiceData from '../CoreACServiceData'

class GenericServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  get mergeChangesetOnActive () {
    return { lastUnseenNotificationTime: null }
  }

  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get hasUnreadActivity () { return !!this._value_('lastUnseenNotificationTime', undefined) }
}

export default GenericServiceData
