const persistence = require('../storage/mailboxStorage')
const { EventEmitter } = require('events')
const MailboxFactory = require('../../shared/Models/Accounts/MailboxFactory')
const { PERSISTENCE_INDEX_KEY } = require('../../shared/constants')

class MailboxStore extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    // Build the current data
    this.index = []
    this.mailboxes = new Map()

    const allRawItems = persistence.allJSONItems()
    Object.keys(allRawItems).forEach((id) => {
      if (id === PERSISTENCE_INDEX_KEY) {
        this.index = allRawItems[id]
      } else {
        this.mailboxes.set(id, MailboxFactory.modelize(id, allRawItems[id]))
      }
    })

    // Listen for changes
    persistence.on('changed', (evt) => {
      if (evt.key === PERSISTENCE_INDEX_KEY) {
        this.index = persistence.getJSONItem(PERSISTENCE_INDEX_KEY)
      } else {
        if (evt.type === 'setItem') {
          this.mailboxes.set(evt.key, MailboxFactory.modelize(evt.key, persistence.getJSONItem(evt.key)))
        }
        if (evt.type === 'removeItem') {
          this.mailboxes.delete(evt.key)
        }
      }
      this.emit('changed', {})
    })
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return the mailboxes in an ordered list
  */
  orderedMailboxes () {
    return this.index
      .map(id => this.mailboxes.get(id))
      .filter((mailbox) => !!mailbox)
  }

  /**
  * @param id: the id of the mailbox
  * @return the mailbox record
  */
  getMailbox (id) {
    return this.mailboxes.get(id)
  }
}

module.exports = new MailboxStore()
