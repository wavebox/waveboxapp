import StorageBucket from './StorageBucket'
import { AVATAR_TIMESTAMP_PREFIX } from 'shared/constants'

class AvatarStorageBucket extends StorageBucket {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super('avatar')
  }

  /* ****************************************************************************/
  // Import/Export
  /* ****************************************************************************/

  /**
  * @overwrite
  * Exports the data in this store
  * @return { name, data } to export
  */
  getExportData () {
    const rawExport = super.getExportData()
    const data = Object.keys(rawExport.data).reduce((acc, id) => {
      if (!id.startsWith(AVATAR_TIMESTAMP_PREFIX)) {
        acc[id] = rawExport.data[id]
      }
      return acc
    }, {})
    return {
      name: rawExport.name,
      data: data
    }
  }

  /**
  * @overwrite
  * Gets the export manifest for this store
  * @return { name, data } to export, or throws an exception
  */
  getExportChangesetManifest () {
    const rawExport = super.getExportData()
    const data = Object.keys(rawExport.data).reduce((acc, id) => {
      if (id.startsWith(AVATAR_TIMESTAMP_PREFIX)) {
        acc[id] = rawExport.data[id]
      }
      return acc
    }, {})
    return {
      name: rawExport.name,
      data: data
    }
  }

  /**
  * @overwrite
  * Gets a set of export values for this store
  * @param keys: the keys to get
  * @return { name, data } to export
  */
  getExportChangeset (keys) {
    const rawExport = super.getExportData()
    const data = keys.reduce((acc, id) => {
      if (rawExport.data[id]) {
        acc[id] = rawExport.data[id]
      } else {
        acc[id] = null
      }
      return acc
    }, {})
    return {
      name: rawExport.name,
      data: data
    }
  }
}

export default new AvatarStorageBucket()
