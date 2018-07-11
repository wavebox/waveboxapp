import CoreACServiceData from '../CoreACServiceData'
import SubclassNotImplementedError from '../SubclassNotImplementedError'
import addressparser from 'addressparser'

class CoreGoogleMailServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Properties : Gmail data
  /* **************************************************************************/

  get historyId () { return this._value_('historyId') }
  get hasHistoryId () { return !!this.historyId }
  get unreadThreads () { return this._value_('unreadThreads', []) }
  get unreadThreadsIndexed () {
    return this.unreadThreads.reduce((acc, thread) => {
      acc[thread.id] = thread
      return acc
    }, {})
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Generates the open data for the message
  * @param thread: the thread to open
  * @param message: the message to open
  */
  generateMessageOpenData (thread, message) { SubclassNotImplementedError('CoreGoogleMailServiceData.generateMessageOpenData') }

  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get trayMessages () {
    return this.unreadThreads.map((thread) => {
      const message = thread.latestMessage
      let fromName = ''
      if (message.from) {
        try {
          fromName = addressparser(message.from)[0].name || message.from
        } catch (ex) {
          fromName = message.from
        }
      }

      return {
        id: `${thread.id}:${thread.historyId}`,
        text: `${fromName} : ${message.subject || 'No Subject'}`,
        extended: {
          title: message.subject || 'No Subject',
          subtitle: fromName,
          optSender: fromName,
          optAvatarText: (fromName || '')[0]
        },
        date: parseInt(message.internalDate),
        data: this.generateMessageOpenData(thread, message)
      }
    })
  }
  get notifications () {
    return this.unreadThreads.map((thread) => {
      const message = thread.latestMessage
      return {
        id: `${thread.id}:${message.internalDate}`,
        title: message.subject || 'No Subject',
        titleFormat: 'text',
        body: [
          { content: message.from, format: 'text' },
          { content: message.snippet, format: 'html' }
        ],
        timestamp: parseInt(message.internalDate),
        data: this.generateMessageOpenData(thread, message)
      }
    })
  }
}

export default CoreGoogleMailServiceData
