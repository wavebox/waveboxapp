import StorageBucket from './StorageBucket'
import { PERSISTENCE_INDEX_KEY } from 'shared/constants'
import MailboxFactory from 'shared/Models/Accounts/MailboxFactory'

class MailboxStorageBucket extends StorageBucket {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super('mailboxes')
  }

  /* ****************************************************************************/
  // Import/Export
  /* ****************************************************************************/

  /**
  * @overwrite
  * Exports the data in this store
  * @return { name, data } to export
  */
  getExportDataSync () {
    const rawExport = super.getExportDataSync()
    const data = Object.keys(rawExport.data).reduce((acc, id) => {
      if (id === PERSISTENCE_INDEX_KEY) {
        acc[id] = rawExport.data[id]
      } else {
        try {
          const mailboxJS = JSON.parse(rawExport.data[id])
          const MailboxClass = MailboxFactory.getClass(mailboxJS.type)
          if (MailboxClass) {
            acc[id] = JSON.stringify(MailboxClass.prepareForExport(id, mailboxJS))
          } else {
            acc[id] = rawExport.data[id]
          }
        } catch (ex) {
          acc[id] = rawExport.data[id]
        }
      }
      return acc
    }, {})

    return {
      name: rawExport.name,
      data: data
    }
  }
}

export default new MailboxStorageBucket()
