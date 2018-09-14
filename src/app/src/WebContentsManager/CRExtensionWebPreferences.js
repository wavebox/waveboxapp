import { CR_EXTENSION_PARTITION_PREFIX } from 'shared/extensionApis'
import Resolver from 'Runtime/Resolver'
import { GuestWebPreferences } from 'WebContentsManager'

class CRExtensionWebPreferences {
  /* ****************************************************************************/
  // Class: WebPreferences
  /* ****************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @return the partition that will be used for the background page
  */
  static partitionIdForExtension (extensionId) {
    return `${CR_EXTENSION_PARTITION_PREFIX}${extensionId}`
  }

  /**
  * Checks if this is an extension partition
  * @param partitionId: the id of the partition
  * @return true if this is an extension partition
  */
  static isExtensionPartition (partitionId) {
    return typeof (partitionId) === 'string'
      ? partitionId.startsWith(CR_EXTENSION_PARTITION_PREFIX)
      : false
  }

  /**
  * @param extensionId: the id of the extension
  * @return the affinity that will be used for the background page
  */
  static affinityIdForExtension (extensionId) {
    return `extension_${extensionId}`
  }

  /**
  * Generates the default browser window preferences for an extension
  * @param extensionId: the extension id to generate for
  * @return an object that can be used to configure a browser window
  */
  static defaultWebPreferences (extensionId) {
    return GuestWebPreferences.sanitizeForGuestUse({
      contextIsolation: false, // Intentional as the extension shares the same namespace as chrome.* api and runs in a semi-priviledged position
      sandbox: true,
      nativeWindowOpen: true,
      sharedSiteInstances: true,
      affinity: this.affinityIdForExtension(extensionId),
      preload: Resolver.crExtensionApi(),
      partition: this.partitionIdForExtension(extensionId)
    })
  }
}

export default CRExtensionWebPreferences
