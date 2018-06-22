import CoreMailboxActions from 'shared/AltStores/Mailbox/CoreMailboxActions'
import alt from '../alt'
import mailboxPersistence from 'Storage/mailboxStorage'
import avatarPersistence from 'Storage/avatarStorage'
import { PERSISTENCE_INDEX_KEY, AVATAR_TIMESTAMP_PREFIX } from 'shared/constants'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

class MailboxActions extends CoreMailboxActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    const mailboxData = mailboxPersistence.allJSONItems()
    const mailboxIndex = mailboxData[PERSISTENCE_INDEX_KEY] || []
    const avatarData = avatarPersistence.allItems()
    return {
      allAvatars: Object.keys(avatarData).reduce((acc, id) => {
        // We don't load the timestamp data into the store at the moment,
        // it's only used by the storage bucket for incremental-diffs
        if (!id.startsWith(AVATAR_TIMESTAMP_PREFIX)) {
          acc[id] = avatarData[id]
        }
        return acc
      }, {}),
      allMailboxes: Object.keys(mailboxData).reduce((acc, id) => {
        if (id !== PERSISTENCE_INDEX_KEY) {
          acc[id] = mailboxData[id]
        }
        return acc
      }, {}),
      mailboxIndex,
      activeMailbox: mailboxIndex[0] || null,
      activeService: CoreMailbox.SERVICE_TYPES.DEFAULT,
      sleepingServices: {}
    }
  }
}

export default alt.createActions(MailboxActions)
