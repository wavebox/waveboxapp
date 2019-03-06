import RuntimePaths from 'Runtime/RuntimePaths'
import fs from 'fs-extra'
import path from 'path'
import pathTool from 'shared/pathTool'

class SAPIExtensionFS {
  /* ****************************************************************************/
  // Container Loaders
  /* ****************************************************************************/

  /**
  * Lists the container ids sync
  * @return an array of container ids
  */
  static listContainerIdsSync () {
    try {
      return fs.readdirSync(RuntimePaths.CONTAINER_API_INSTALL_PATH, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    } catch (ex) {
      return []
    }
  }

  /**
  * Reads the container manifest sync
  * @param containerId: the id of the container
  * @return the manifest
  */
  static readContainerManifestSync (containerId) {
    return fs.readJsonSync(path.join(RuntimePaths.CONTAINER_API_INSTALL_PATH, containerId, 'manifest.json'))
  }

  /**
  * Writes a container log sync
  * @param containerId: the id of the container
  * @param logItems: the items in the log
  * @return true on success, false otherwise
  */
  static writeContainerLogSync (containerId, logItems) {
    const logStr = logItems.join('\n')

    try {
      fs.writeFileSync(path.join(RuntimePaths.CONTAINER_API_INSTALL_PATH, containerId, 'load.log'), logStr)
      return true
    } catch (ex) {
      console.error('Failed to write container log', ex)
      return false
    }
  }

  /**
  * Ensures the container path exists
  * @param containerId: the id of the container
  * @return the path that was created
  */
  static ensureContainerPathSync (containerId) {
    const containerPath = path.join(RuntimePaths.CONTAINER_API_INSTALL_PATH, containerId)
    fs.ensureDirSync(containerPath)
    return containerPath
  }

  /* ****************************************************************************/
  // Sapi
  /* ****************************************************************************/

  /**
  * Loads a container asset
  * @param containerId: the id of the container
  * @param asset: the asset path
  * @return the content of the file or undefined on error
  */
  static loadContainerSAPIStringAssetSync (containerId, asset) {
    if (!containerId || !asset) { return undefined }

    const containerPath = path.join(RuntimePaths.CONTAINER_API_INSTALL_PATH, containerId)
    const assetPath = pathTool.scopeToDir(containerPath, asset)
    if (!assetPath) { return undefined }

    try {
      return fs.readFileSync(assetPath, 'utf8')
    } catch (ex) {
      return undefined
    }
  }
}

export default SAPIExtensionFS
