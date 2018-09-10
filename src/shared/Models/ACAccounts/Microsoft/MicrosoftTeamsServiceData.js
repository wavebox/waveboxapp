import CoreACServiceData from '../CoreACServiceData'

const TITLE_COUNT_RE = new RegExp('^[(]([0-9]+)[)].*?$')

class MicrosoftTeamsServiceDaa extends CoreACServiceData {
  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get unreadCount () {
    if (!this.documentTitle) { return 0 }

    const match = TITLE_COUNT_RE.exec(this.documentTitle)
    if (match) {
      const matchCount = parseInt(match[1])
      if (!isNaN(matchCount)) { return matchCount }
    }

    return 0
  }
  get trayMessages () {
    const count = this.unreadCount
    return count === 0 ? [] : [
      {
        id: `auto_${count}`,
        text: `${count} unseen notification${count > 1 ? 's' : ''}`,
        date: new Date().getTime(),
        data: {}
      }
    ]
  }
}

export default MicrosoftTeamsServiceDaa
