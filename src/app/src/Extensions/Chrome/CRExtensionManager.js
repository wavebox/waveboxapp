import { app } from 'electron'
import CRExtensionRuntimeHandler from './CRExtensionRuntimeHandler'
import CRExtensionFS from './CRExtensionFS'
import CRExtensionDownloader from './CRExtensionDownloader'
import {
  CRExtension,
  CRExtensionManifest
} from 'shared/Models/CRExtension'
import {
  CR_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import { userStore } from 'stores/user'
import { crextensionActions } from 'stores/crextension'
import { evtMain } from 'AppEvents'

class CRExtensionManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.runtimeHandler = new CRExtensionRuntimeHandler()
    this.extensions = new Map()
    this.downloader = new CRExtensionDownloader()
    this.installQueue = new Set()
    this.uninstallQueue = new Set()
    this.updateQueue = new Set()
    this.isCheckingForUpdates = false
    this._isSetup_ = false

    evtMain.on(evtMain.WB_UPDATE_INSTALLED_EXTENSIONS, () => { this.updateExtensions() })
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get supportedProtocols () { return [CR_EXTENSION_PROTOCOL] }

  /* ****************************************************************************/
  // Integration
  /* ****************************************************************************/

  /**
  * Sets up support
  */
  setup () {
    if (this._isSetup_) { return }
    this._isSetup_ = true
    app.on('session-created', (ses) => {
      this.runtimeHandler.registerForSessionLoadRequests(ses.protocol)
    })
  }

  /* ****************************************************************************/
  // Install / Deletion
  /* ****************************************************************************/

  /**
  * Uninstalls an extension
  * @param extensionId: the id of the extension
  */
  uninstallExtension (extensionId) {
    if (!this.extensions.has(extensionId)) { throw new Error(`Extension with id "${extensionId}" not installed`) }
    if (this.uninstallQueue.has(extensionId)) { throw new Error(`Extension with id "${extensionId}" already set for uninstall on relaunch`) }

    CRExtensionFS.setForRemoval(extensionId)
    this.uninstallQueue.add(extensionId)

    this._handleSendInstallMetadata()
  }

  /**
  * Installs an extension
  * @param extensionId: the id of the extension
  * @param installInfo: the info about the install
  */
  installExtension (extensionId, installInfo) {
    if (this.downloader.hasInProgressDownload(extensionId)) { return }

    if (installInfo.remoteUrl) {
      this.downloader.downloadHostedExtension(extensionId, installInfo.remoteUrl)
        .then(
          () => {
            this.installQueue.add(extensionId)
            this._handleSendInstallMetadata()
          },
          (_err) => { this._handleSendInstallMetadata() }
        )
      this._handleSendInstallMetadata()
    } else if (installInfo.cwsUrl && installInfo.waveboxUrl) {
      this.downloader.downloadCWSExtension(extensionId, installInfo.cwsUrl, installInfo.waveboxUrl)
        .then(
          () => {
            this.installQueue.add(extensionId)
            this._handleSendInstallMetadata()
          },
          (_err) => {
            this._handleSendInstallMetadata()
          }
        )
      this._handleSendInstallMetadata()
    }
  }

  /**
  * Checks for updates and updates the extensions
  * @return true if update checking started, false otherwise
  */
  updateExtensions () {
    if (this.isCheckingForUpdates) { return false }
    this.isCheckingForUpdates = true
    this._handleSendInstallMetadata()

    const extensionsToUpdate = Array.from(this.extensions.values())
      .filter((extension) => !this.updateQueue.has(extension.id))

    if (extensionsToUpdate.length === 0) { return false }

    Promise.resolve()
      .then(() => this.downloader.updateCWSExtensions(extensionsToUpdate))
      .then((updateIds) => {
        updateIds.forEach((id) => {
          this.updateQueue.add(id)
        })
        this._handleSendInstallMetadata()
      })
      .catch(() => Promise.resolve())
      .then(() => {
        this.isCheckingForUpdates = false
        this._handleSendInstallMetadata()
      })

    return true
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads all the extensions in the extension directory
  */
  loadExtensionDirectory () {
    const disabledIds = userStore.getState().disabledExtensionIdSet()
    const extensions = CRExtensionFS.listInstalledExtensionIds()
      .map((extensionId) => CRExtensionFS.updateEntry(extensionId))
      .filter((info) => !!info)
      .filter((info) => !disabledIds.has(info.extensionId))

    extensions.forEach((info) => {
      try {
        this.loadExtensionVersion(info.extensionId, info.versionString)
      } catch (ex) {
        console.error('Failed to load extension', ex)
      }
    })
  }

  /**
  * Adds an extension
  * @param extensionId: the id of the extension
  * @param versionString: the version string
  * @return the extension object
  */
  loadExtensionVersion (extensionId, versionString) {
    const locale = app.getLocale().replace(/-.*$/, '').toLowerCase()
    const manifest = CRExtensionFS.loadTranslatedManifest(extensionId, versionString, locale)
    const srcPath = CRExtensionFS.resolvePath(extensionId, versionString)
    const extension = new CRExtension(srcPath, manifest)
    if (!CRExtensionManifest.isValidManifestData(manifest)) {
      throw new Error('Extension is not valid')
    }
    if (this.extensions.has(extension.id)) {
      throw new Error('Extension already installed')
    }

    this.extensions.set(extension.id, extension)
    this.runtimeHandler.startExtension(extension)

    this._handleSendInstallMetadata()
    return extension
  }

  /* ****************************************************************************/
  // Metadata
  /* ****************************************************************************/

  /**
  * Generates the full install metadata
  * @return install metadata for each known extension
  */
  generateInstallMetadata () {
    const allExtensionIds = [].concat(
      this.downloader.downloadingExtensionIds,
      Array.from(this.extensions.keys()),
      Array.from(this.installQueue),
      Array.from(this.uninstallQueue)
    )

    const keyset = new Set(allExtensionIds)
    return Array.from(keyset).reduce((acc, extensionId) => {
      acc[extensionId] = {
        downloading: this.downloader.hasInProgressDownload(extensionId),
        installed: this.extensions.has(extensionId),
        willInstall: this.installQueue.has(extensionId),
        willUninstall: this.uninstallQueue.has(extensionId),
        willUpdate: this.updateQueue.has(extensionId),
        checkingUpdates: this.isCheckingForUpdates && !this.updateQueue.has(extensionId)
      }
      return acc
    }, {})
  }

  /**
  * Sends the install metadata to all listeners
  */
  _handleSendInstallMetadata () {
    const metadata = this.generateInstallMetadata()
    crextensionActions.installMetaChanged.defer(metadata)
  }
}

export default new CRExtensionManager()
