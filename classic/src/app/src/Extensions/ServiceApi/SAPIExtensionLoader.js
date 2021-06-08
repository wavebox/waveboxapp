import { shell } from 'electron'
import SAPIExtensionFS from './SAPIExtensionFS'
import { ACContainerSAPI } from 'shared/Models/ACContainer'
import Joi from 'joi'

class SAPIExtensionLoader {
  /* ****************************************************************************/
  // Loaders
  /* ****************************************************************************/

  /**
  * Loads the containers from disk, validating as they are loaded
  * @return an object of container id to container data. Only valid data
  */
  loadContainersSync () {
    return SAPIExtensionFS.listContainerIdsSync().reduce((acc, containerId) => {
      const container = this.loadContainerSync(containerId)
      if (container) {
        acc[containerId] = container
      }
      return acc
    }, {})
  }

  /**
  * Loads a container from disk, ensuring it's validated
  * @return the container data or undefined
  */
  loadContainerSync (containerId) {
    const log = [
      `Loading "${containerId}" ${new Date().toString()}`
    ]

    // Load manifest
    let manifest
    try {
      manifest = SAPIExtensionFS.readContainerManifestSync(containerId)
      log.push('Loaded manifest.json')
    } catch (ex) {
      log.push('Failed to load manifest.json with the following error:')
      log.push(`${ex}`)
      SAPIExtensionFS.writeContainerLogSync(containerId, log)
      return undefined
    }

    // Validate data
    const { hasErrors, errors } = ACContainerSAPI.validateData(Joi, manifest)
    if (hasErrors) {
      log.push('Failed to validate manifest.json with the following errors:')
      errors.forEach((e) => log.push(e))
      SAPIExtensionFS.writeContainerLogSync(containerId, log)
      return undefined
    } else {
      log.push('Validated manifest.json')
    }

    log.push(`Loading complete ${new Date().toString()}`)
    SAPIExtensionFS.writeContainerLogSync(containerId, log)
    return manifest
  }

  /* ****************************************************************************/
  // Development
  /* ****************************************************************************/

  /**
  * Opens the install folder for a user ensuring the folder is available
  * @param containerId: the id of the container to open
  */
  openInstallFolderForUser (containerId) {
    const containerPath = SAPIExtensionFS.ensureContainerPathSync(containerId)
    shell.showItemInFolder(containerPath)
  }
}

export default new SAPIExtensionLoader()
