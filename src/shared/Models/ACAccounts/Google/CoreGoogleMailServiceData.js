import CoreACServiceData from '../CoreACServiceData'
import SubclassNotImplementedError from '../SubclassNotImplementedError'
import addressparser from 'addressparser'

// @Thomas101#3
class CoreGoogleMailServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Properties : Gmail data
  /* **************************************************************************/

  get historyId () { return this._value_('historyId') }
  get hasHistoryId () { return !!this.historyId }
  get unreadThreads () {
    // We've had reports that null can be set as an array value. Filter those out
    // so we're always valid. It looks like the null comes from Google, but we
    // can't confirm. We've also patched upstream in GoogleHTTP.fullyResolveGmailThreadHeaders
    // so this can probably be removed in a future release
    return this._value_('unreadThreads_v2', []).filter((v) => !!v)
  }
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
      if (thread.version === 2) {
        return {
          id: thread.id,
          text: `${thread.fromName || thread.fromEmail || ''} : ${thread.title || 'No Subject'}`,
          extended: {
            title: thread.title || 'No Subject',
            subtitle: thread.fromName || thread.fromEmail || '',
            optSender: thread.fromName || thread.fromEmail || '',
            optAvatarText: (thread.fromName || thread.fromEmail || '')[0]
          },
          date: thread.issued,
          data: this.generateMessageOpenData(thread, thread)
        }
      } else {
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
      }
    })
  }
  get notifications () {
    return this.unreadThreads.map((thread) => {
      if (thread.version === 2) {
        return {
          id: thread.id,
          title: thread.title || 'No Subject',
          titleFormat: 'text',
          body: [
            { content: thread.fromName || thread.fromEmail || '', format: 'text' },
            { content: thread.summary, format: 'html' }
          ],
          timestamp: thread.issued,
          data: this.generateMessageOpenData(thread, thread)
        }
      } else {
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
      }
    })
  }
}

export default CoreGoogleMailServiceData
