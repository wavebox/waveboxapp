import CoreACServiceData from '../CoreACServiceData'

const BADGE_REGEXP = new RegExp('(chat-favicon-new-non-notif|chat-favicon-new-notif)')

class GoogleAlloServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get hasUnreadActivity () {
    const hasUnread = !!this.favicons.find((favicon) => {
      return BADGE_REGEXP.exec(favicon) !== null
    })
    return hasUnread
  }
}

export default GoogleAlloServiceData
