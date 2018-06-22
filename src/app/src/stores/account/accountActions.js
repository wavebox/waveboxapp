import CoreAccountActions from 'shared/AltStores/Account/CoreAccountActions'
import alt from '../alt'
import mailboxPersistence from 'Storage/acmailboxStorage'
import mailboxAuthPersistence from 'Storage/acmailboxauthStorage'
import servicePersistence from 'Storage/acserviceStorage'
import servicedataPersistence from 'Storage/acservicedataStorage'
import avatarPersistence from 'Storage/avatarStorage'
import { PERSISTENCE_INDEX_KEY, AVATAR_TIMESTAMP_PREFIX } from 'shared/constants'

class AccountActions extends CoreAccountActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    const rawMailboxes = mailboxPersistence.allJSONItems()
    const rawMailboxAuths = mailboxAuthPersistence.allJSONItems()
    const rawServices = servicePersistence.allJSONItems()
    const rawServiceData = servicedataPersistence.allJSONItems()
    const rawAvatars = avatarPersistence.allItems()

    return {
      mailboxIndex: rawMailboxes[PERSISTENCE_INDEX_KEY] || [],
      mailboxes: Object.keys(rawMailboxes).reduce((acc, id) => {
        if (id !== PERSISTENCE_INDEX_KEY) {
          acc[id] = rawMailboxes[id]
        }
        return acc
      }, {}),
      services: rawServices,
      serviceData: rawServiceData,
      mailboxAuth: rawMailboxAuths,
      activeService: null,
      sleepingServices: {},
      avatars: Object.keys(rawAvatars).reduce((acc, id) => {
        // We don't load the timestamp data into the store at the moment,
        // it's only used by the storage bucket for incremental-diffs
        if (!id.startsWith(AVATAR_TIMESTAMP_PREFIX)) {
          acc[id] = rawAvatars[id]
        }
        return acc
      }, {})
    }
  }
}

export default alt.createActions(AccountActions)
