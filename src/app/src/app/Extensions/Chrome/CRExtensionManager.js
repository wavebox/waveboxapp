const { app, ipcMain, webContents } = require('electron')
const fs = require('fs-extra')
const decompress = require('decompress')
const path = require('path')
const CRExtensionRuntimeHandler = require('./CRExtensionRuntimeHandler')
const CRExtensionFS = require('./CRExtensionFS')
const uuid = require('uuid')
const {
  CRExtension,
  CRExtensionManifest
} = require('../../../shared/Models/CRExtension')
const {
  WBECRX_GET_EXTENSION_INSTALL_META,
  WBECRX_EXTENSION_INSTALL_META_CHANGED,
  WBECRX_UNINSTALL_EXTENSION,
  WBECRX_INSTALL_EXTENSION
} = require('../../../shared/ipcEvents')
const {
  CR_EXTENSION_DOWNLOAD_PARTITION_PREFIX
} = require('../../../shared/extensionApis')
const {
  CHROME_EXTENSION_DOWNLOAD_PATH,
  CHROME_EXTENSION_INSTALL_PATH
} = require('../../MProcManagers/PathManager')

class CRExtensionManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.runtimeHandler = new CRExtensionRuntimeHandler()
    this.extensions = new Map()
    this.downloads = new Map()
    this.installQueue = new Set()
    this.uninstallQueue = new Set()
    this._isSetup_ = false

    ipcMain.on(WBECRX_GET_EXTENSION_INSTALL_META, (evt) => {
      evt.returnValue = this._generateInstallMetadata()
    })
    ipcMain.on(WBECRX_UNINSTALL_EXTENSION, (evt, extensionId) => {
      this.uninstallExtension(extensionId)
    })
    ipcMain.on(WBECRX_INSTALL_EXTENSION, (evt, extensionId, url) => {
      this.installExtension(extensionId, url)
    })
  }

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
  * @param downloadUrl: the url to download
  */
  installExtension (extensionId, downloadUrl) {
    if (this.downloads.has(extensionId)) { return }

    const installId = uuid.v4()
    const downloader = webContents.create({
      partition: `${CR_EXTENSION_DOWNLOAD_PARTITION_PREFIX}${installId}`,
      isBackgroundPage: true,
      commandLineSwitches: '--background-page'
    })
    downloader.session.on('will-download', (evt, item, webContents) => {
      const downloadPath = path.join(CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.zip`)
      const extractPath = path.join(CHROME_EXTENSION_INSTALL_PATH, extensionId)
      fs.ensureDirSync(CHROME_EXTENSION_DOWNLOAD_PATH)
      item.setSavePath(downloadPath)

      item.on('done', (e, state) => {
        if (state === 'completed') {
          downloader.destroy()
          fs.ensureDirSync(extractPath)
          decompress(downloadPath, extractPath)
            .then((files) => {
              try { fs.removeSync(downloadPath) } catch (ex) { }
              this.downloads.delete(extensionId)
              this.installQueue.add(extensionId)
              this._handleSendInstallMetadata()
            })
            .catch((e) => {
              try { fs.removeSync(downloadPath) } catch (ex) { }
              this.downloads.delete(extensionId)
              this._handleSendInstallMetadata()
            })
        } else {
          downloader.destroy()
          this.downloads.delete(extensionId)
          this._handleSendInstallMetadata()
        }
      })
    })

    this.downloads.set(extensionId, {
      webContents: downloader,
      installId: installId,
      extensionId: extensionId
    })
    downloader.downloadURL(downloadUrl)
    this._handleSendInstallMetadata()
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads all the extensions in the extension directory
  */
  loadExtensionDirectory () {
    const extensions = CRExtensionFS.listInstalledExtensionIds()
      .map((extensionId) => CRExtensionFS.updateEntry(extensionId))
      .filter((info) => !!info)

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
  _generateInstallMetadata () {
    const allExtensionIds = [].concat(
      Array.from(this.downloads.keys()),
      Array.from(this.extensions.keys()),
      Array.from(this.installQueue),
      Array.from(this.uninstallQueue)
    )

    const keyset = new Set(allExtensionIds)
    return Array.from(keyset).reduce((acc, extensionId) => {
      acc[extensionId] = {
        downloading: this.downloads.has(extensionId),
        installed: this.extensions.has(extensionId),
        willInstall: this.installQueue.has(extensionId),
        willUninstall: this.uninstallQueue.has(extensionId),
        willUpdate: false
      }
      return acc
    }, {})
  }

  /**
  * Sends the install metadata to all listeners
  */
  _handleSendInstallMetadata () {
    const metadata = this._generateInstallMetadata()
    webContents.getAllWebContents().forEach((wc) => {
      wc.send(WBECRX_EXTENSION_INSTALL_META_CHANGED, metadata)
    })
  }
}

module.exports = new CRExtensionManager()
