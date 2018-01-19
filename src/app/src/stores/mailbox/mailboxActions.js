import CoreMailboxActions from 'shared/AltStores/Mailbox/CoreMailboxActions'
import alt from '../alt'
import mailboxPersistence from 'storage/mailboxStorage'
import avatarPersistence from 'storage/avatarStorage'
import { PERSISTENCE_INDEX_KEY } from 'shared/constants'
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

    //TODO I need to be done differently now
    /*ipcRenderer.sendSync(WB_PREPARE_MAILBOX_SESSION, { // Sync us across bridge so everything is setup before webview created
      partition: 'persist:' + mailboxModel.partition,
      mailboxType: mailboxModel.type
    })*/

    return {
      allAvatars: avatarPersistence.allItems(),
      allMailboxes: Object.keys(mailboxData).reduce((acc, id) => {
        if (id !== PERSISTENCE_INDEX_KEY) {
          acc[id] = mailboxData[id]
        }
        return acc
      }, {}),
      mailboxIndex: mailboxData[PERSISTENCE_INDEX_KEY] || [],
      activeMailbox: mailboxData[PERSISTENCE_INDEX_KEY][0] || null,
      activeService: CoreMailbox.SERVICE_TYPES.DEFAULT,
      sleepingServices: []
    }
  }
}

export default alt.createActions(MailboxActions)
