import { app } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import RuntimePaths from 'Runtime/RuntimePaths'
import {
  CRExtension,
  CRExtensionI18n,
  CRExtensionVersionParser
} from 'shared/Models/CRExtension'
import { CRExtensionWebPreferences } from 'WebContentsManager'

const UNINSTALL_FLAG = '__uninstall__'
const PURGE_FLAG = '__purge__'

class CRExtensionFS {
  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Fetches the extension paths
  * @return a list of paths to the extensions
  */
  static listInstalledExtensionIds () {
    try {
      return fs.readdirSync(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH)
    } catch (ex) {
      return []
    }
  }

  /**
  * Gets the extension id and version string from the manifest
  * @param extensionId: the id of the extension
  * @param versionString: the version string to get
  * @return the manifest
  */
  static readManifest (extensionId, versionString) {
    try {
      const manifest = fs.readJsonSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, versionString, 'manifest.json'))
      return manifest
    } catch (ex) {
      return {}
    }
  }

  /**
  * Gets the version info for an installed extension
  * @param extensionId: the id of the extension
  * @return the valid versions as { version, revision, path }
  */
  static listInstalledVersions (extensionId) {
    let versionStrings
    try {
      versionStrings = fs.readdirSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId))
    } catch (ex) {
      versionStrings = []
    }

    const versionInfo = versionStrings
      .map((versionStr) => {
        const components = versionStr.split('_')
        const version = CRExtensionVersionParser.valid(components[0])
        if (version === null) { return undefined }

        const revision = parseInt(components.slice(1).join('_'))
        return {
          path: path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, versionStr),
          extensionId: extensionId,
          version: version,
          revision: isNaN(revision) ? 0 : revision,
          versionString: versionStr
        }
      })
      .filter((info) => !!info)
      .filter((info) => {
        const manifestInfo = this.readManifest(info.extensionId, info.versionString)
        if (manifestInfo.wavebox_extension_id !== info.extensionId) { return false }
        if (manifestInfo.version !== info.version) { return false }
        return true
      })

    return versionInfo
  }

  /**
  * Gets the latest revision for a given version
  * @param extensionId: the id of the extension
  * @param version: the extension version
  * @return the latest revision or undefined if there is none
  */
  static getLatestRevisionForVersion (extensionId, version) {
    const versions = this.listInstalledVersions(extensionId)
    let latest
    versions.forEach((installed) => {
      if (installed.version !== version) { return }
      if (latest === undefined) {
        latest = installed.revision
      } else if (installed.revision > latest) {
        latest = installed.revision
      }
    })

    return latest
  }

  /**
  * Checks to see if an extension should be removed
  * @param extensionId: the id of the extension
  * @return true if it should be removed
  */
  static isSetForRemoval (extensionId) {
    return fs.existsSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, UNINSTALL_FLAG))
  }

  /**
  * Checks to see if an extension version should be removed
  * @param extensionId: the id of the extension
  * @param versionString: the version string
  * @return true if it should be removed
  */
  static isSetForPurge (extensionId, versionString) {
    return fs.existsSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, PURGE_FLAG + versionString))
  }

  /**
  * @param extensionId: the id of the extension
  * @param versionString: the currently installed version string
  * @return the path to the extension
  */
  static resolvePath (extensionId, versionString) {
    return path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, versionString)
  }

  /**
  * Loads the manifest wrapped in its appropriate model
  * @param extensionId: the id of the extension
  * @param versionString: the version string to get
  * @param locale: the locale to load the manifest for
  * @return the manifest
  */
  static loadTranslatedManifest (extensionId, versionString, locale) {
    const rootPath = path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, versionString)
    const manifest = fs.readJsonSync(path.join(rootPath, 'manifest.json'))

    let messages
    try {
      messages = fs.readJsonSync(path.join(rootPath, '_locales', locale, 'messages.json'))
    } catch (ex) {
      try {
        const defaultLocale = CRExtension._sanitizePathValue_(manifest.default_locale || 'en')
        messages = fs.readJsonSync(path.join(rootPath, '_locales', defaultLocale, 'messages.json'))
      } catch (ex) {
        messages = {}
      }
    }

    return CRExtensionI18n.translatedManifest(messages, manifest)
  }

  /* ****************************************************************************/
  // Updating
  /* ****************************************************************************/

  /**
  * Updates an extension entry by either upgrading it or removing it
  * @param extensionId: the id of the extension
  * @return the extension info or undefined
  */
  static updateEntry (extensionId) {
    // Check for removal
    if (this.isSetForRemoval(extensionId)) {
      try { fs.removeSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId)) } catch (ex) { }
      return undefined
    }

    // Load the entry
    let versions = this.listInstalledVersions(extensionId)
    let didPurge = false

    // Run a purge
    versions.forEach((version) => {
      if (this.isSetForPurge(extensionId, version.versionString)) {
        didPurge = true
        try { fs.removeSync(version.path) } catch (ex) { }
        try { fs.removeSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, PURGE_FLAG + version.versionString)) } catch (ex) { }
      }
    })
    if (didPurge) {
      versions = this.listInstalledVersions(extensionId)
    }

    // Run an update
    if (versions.length > 1) {
      const sortedVersions = Array.from(versions)
        .sort((a, b) => {
          if (a.version === b.version) {
            return a.revision > b.revision ? -1 : 1
          } else {
            return CRExtensionVersionParser.gt(a.version, b.version) ? -1 : 1
          }
        })
      const latest = sortedVersions[0]
      const remove = sortedVersions.slice(1)
      remove.forEach((info) => {
        try { fs.removeSync(info.path) } catch (ex) { }
      })
      return latest
    } else if (versions.length === 1) {
      return versions[0]
    } else {
      return undefined
    }
  }

  /**
  * Previously we namespaced some extensions with extensionid-wavebox we no longer
  * want to do this, so migrate them and their partition data before launch
  * Introduced in Wavebox 4.8.3 - 4.8.4
  * This function will throw on errors
  * @param info: the loaded extension info
  * @return the updated info or the original info
  */
  static migrateWaveboxNamespacedExtension (info) {
    const shouldMigrate = [
      'dheionainndbbpoacpnopgmnihkcmnkl-wavebox',
      'mdanidgdpmkimeiiojknlnekblgmpdll-wavebox',
      'elifhakcjgalahccnjkneoccemfahfoa-wavebox'
    ].includes(info.extensionId)
    if (!shouldMigrate) { return info }

    const nextExtensionId = info.extensionId.substr(0, info.extensionId.length - 8)
    const nextPath = path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, nextExtensionId, info.versionString)
    const nextManifestPath = path.join(nextPath, 'manifest.json')

    // Move the extension
    fs.moveSync(info.path, nextPath)
    fs.removeSync(path.dirname(info.path))
    fs.writeJSONSync(nextManifestPath, {
      ...fs.readJSONSync(nextManifestPath),
      wavebox_extension_id: nextExtensionId
    })

    // Move the extension data
    const prevPartitionSeg = CRExtensionWebPreferences.partitionIdForExtension(info.extensionId).replace('persist:', '')
    const nextPartitionSeg = CRExtensionWebPreferences.partitionIdForExtension(nextExtensionId).replace('persist:', '')
    try {
      fs.moveSync(
        path.join(app.getPath('userData'), 'Partitions', encodeURIComponent(prevPartitionSeg)),
        path.join(app.getPath('userData'), 'Partitions', encodeURIComponent(nextPartitionSeg))
      )
    } catch (ex) {
      // Don't fall over if the partition data isn't available
    }

    return {
      ...info,
      extensionId: nextExtensionId,
      path: nextPath
    }
  }

  /* ****************************************************************************/
  // Removing
  /* ****************************************************************************/

  /**
  * Removes an extension with the given id
  * @param extensionId
  */
  static setForRemoval (extensionId) {
    fs.writeFileSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, UNINSTALL_FLAG), UNINSTALL_FLAG)
  }

  /**
  * Sets an extension for purge
  * @param extensionId: the id of the extension
  * @param versionStr: the version string of the dir to purge
  */
  static setForPurge (extensionId, versionStr) {
    fs.writeFileSync(path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId, PURGE_FLAG + versionStr), PURGE_FLAG)
  }
}

export default CRExtensionFS
