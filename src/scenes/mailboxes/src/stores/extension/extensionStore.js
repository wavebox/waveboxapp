import alt from '../alt'
import actions from './extensionActions'
import persistence from './extensionPersistence'
import { CoreExtension, CoreExtensionManifest } from 'shared/Models/Extensions'
import {
  WB_PREPARE_EXTENSION_SESSION
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import path from 'path'

const fs = window.appNodeModulesRequire('fs-extra')
const { USER_EXTENSION_INSTALL_PATH } = window.mprocManager('PathManager')
const LOG_PREFIX = '[WB_EXTN]'

class ExtensionStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.installed = new Map()

    /* ****************************************/
    // Installed
    /* ****************************************/

    /**
    * @param installId: the id of the extension to get
    * @return the extension or null
    */
    this.getInstalled = (installId) => {
      return this.installed.get(installId) || null
    }

    /**
    * @return a list of all installed extensions
    */
    this.allInstalled = () => {
      const all = []
      this.installed.forEach((extension) => { all.push(extension) })
      return all
    }

    /**
    * @param extensionId: the id of the extension
    * @return the extension with the given extension id or null
    */
    this.getInstalledWithExtensionId = (extensionId) => {
      for (let extension of this.installed.values()) {
        if (extension.extensionId === extensionId) { return extension }
      }
      return null
    }

    /**
    * @param position = undefined: the position to filter by, or undefined to not filter
    * @return a list of all extensions that are installed as toolbar windows
    */
    this.getInstalledWithToolwindows = (position = undefined) => {
      return this.allInstalled()
        .filter((e) => e.manifest.hasToolwindow && (!position || e.manifest.toolwindowPosition === position))
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleLoad: actions.LOAD,
      handleConsoleInstall: actions.CONSOLE_INSTALL,
      handleConsoleUpdate: actions.CONSOLE_UPDATE,
      handleConsoleUninstall: actions.CONSOLE_UNINSTALL,
      handleConsoleList: actions.CONSOLE_LIST
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad () {
    const allExtensions = persistence.allJSONItemsSync()
    this.installed = new Map()

    Object.keys(allExtensions).forEach((id) => {
      const extension = new CoreExtension(allExtensions[id])
      this.installed.set(id, extension)

      if (extension.manifest.hasHostedComponent) {
        ipcRenderer.sendSync(WB_PREPARE_EXTENSION_SESSION, { // Sync us across bridge so everything is setup before webview created
          partition: 'persist:' + extension.installId
        })
      }
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * @param extension: the extension
  * @return the install path of the extension
  */
  _extensionInstallPath (extension) {
    return path.join(this._extensionRootPath(extension), 'bin')
  }

  /**
  * @param extension: the extension
  * @return the root path of the extension
  */
  _extensionRootPath (extension) {
    return path.join(USER_EXTENSION_INSTALL_PATH, extension.installId)
  }

  /* **************************************************************************/
  // Install utils
  /* **************************************************************************/

  /**
  * Saves the extension and ensures everything is setup to provide for it.
  * This should only be called on update or install
  * @param extensionJS: the underlying js to save
  * @param extension: the extension to save
  */
  _saveAndConfigureNewExtension (extensionJS, extension) {
    this.installed.set(extension.id, extension)
    persistence.setJSONItem(extension.id, extensionJS)

    if (extension.manifest.hasHostedComponent) {
      ipcRenderer.sendSync(WB_PREPARE_EXTENSION_SESSION, { // Sync us across bridge so everything is setup before webview created
        partition: 'persist:' + extension.installId
      })
    }
  }

  /* **************************************************************************/
  // Manipulators Utils
  /* **************************************************************************/

  /**
  * Installs an extension
  * @param extensionPath: the path to the extension
  * @return promise
  */
  _install (extensionPath) {
    return Promise.resolve()
      .then(() => this._loadManifest(extensionPath))
      .then(({manifest, warnings}) => {
        const extensionJS = CoreExtension.createJS(manifest)
        const extension = new CoreExtension(extensionJS)
        const installDir = this._extensionInstallPath(extension)

        if (this.getInstalledWithExtensionId(extension.extensionId)) {
          return Promise.reject(new Error('Extension already installed'))
        }

        return Promise.resolve()
          .then(() => fs.ensureDir(installDir))
          .then(() => fs.copy(extensionPath, installDir))
          .then(() => {
            this._saveAndConfigureNewExtension(extensionJS, extension)
            this.emitChange()
            return Promise.resolve({ extension: extension, warnings: warnings })
          })
      })
  }

  /**
  * Validates a manifest
  * @param extensionPath: the path to the extension
  * @return promise
  */
  _loadManifest (extensionPath) {
    return Promise.resolve()
      .then(() => fs.readJson(path.join(extensionPath, 'manifest.json')))
      .then((manifest) => {
        const {errors, warnings} = CoreExtensionManifest.validateManifest(manifest)
        if (errors.length) {
          const error = new Error('Manifest failed to validate')
          error.info = errors
          return Promise.reject(error)
        }

        return Promise.resolve({ manifest: manifest, warnings: warnings })
      })
  }

  /**
  * Updates an extension
  * @param extensionPath: the path to the extension
  * @return promsie
  */
  _update (extensionPath) {
    return Promise.resolve()
      .then(() => this._loadManifest(extensionPath))
      .then(({manifest, warnings}) => {
        const extensionId = CoreExtensionManifest.getExtensionId(manifest)
        const prevExtension = this.getInstalledWithExtensionId(extensionId)

        if (!prevExtension) {
          return Promise.reject(new Error('Cannot update an extension that is not installed'))
        }

        const extensionJS = prevExtension.changeData({
          manifest: manifest,
          installTime: new Date().getTime()
        })
        const extension = new CoreExtension(extensionJS)
        const installDir = this._extensionInstallPath(extension)

        return Promise.resolve()
          .then(() => fs.ensureDir(installDir))
          .then(() => fs.remove(installDir))
          .then(() => fs.copy(extensionPath, installDir))
          .then(() => {
            this._saveAndConfigureNewExtension(extensionJS, extension)
            this.emitChange()
            return Promise.resolve({ prevExtension: prevExtension, extension: extension, warnings: warnings })
          })
      })
  }

  /**
  * Uninstalls an extension
  * @param extensionId: the extensionId of the extension
  * @return promise
  */
  _uninstall (extensionId) {
    const extension = this.getInstalledWithExtensionId(extensionId)

    if (!extension) {
      const error = new Error('Extension not installed')
      error.info = extensionId
      return Promise.reject(error)
    }

    return Promise.resolve()
      .then(() => fs.remove(this._extensionRootPath(extension)))
      .then(() => {
        this.installed.delete(extension.id)
        persistence.removeItem(extension.id)
        this.emitChange()
        return Promise.resolve({ extension: extension })
      })
  }

  /* **************************************************************************/
  // Console manipulators
  /* **************************************************************************/

  handleConsoleInstall ({ extensionPath }) {
    this.preventDefault()

    console.warn(`${LOG_PREFIX} Thanks for trying the preview version of the Wavebox Extension API`)
    console.log(`${LOG_PREFIX} Installing ${extensionPath}...`)
    Promise.resolve()
      .then(() => this._install(extensionPath))
      .then(({ extension, warnings }) => {
        if (warnings.length) {
          console.log(`${LOG_PREFIX} Install warnings:`, warnings)
        }
        console.log(`${LOG_PREFIX} Install complete ${extension.humanizedIdentifier}`)
      })
      .catch((err) => {
        console.log(`${LOG_PREFIX} Install failed: ${err}`, err)
      })
  }

  handleConsoleUpdate ({ extensionPath }) {
    this.preventDefault()

    console.warn(`${LOG_PREFIX} Thanks for trying the preview version of the Wavebox Extension API`)
    console.log(`${LOG_PREFIX} Updating ${extensionPath}...`)
    Promise.resolve()
      .then(() => this._update(extensionPath))
      .then(({prevExtension, extension, warnings}) => {
        if (warnings.length) {
          console.log(`${LOG_PREFIX} Install warnings:`, warnings)
        }
        console.log(`${LOG_PREFIX} Update complete ${extension.humanizedIdentifier}. ${prevExtension.version} -> ${extension.version}`)
      })
      .catch((err) => {
        console.log(`${LOG_PREFIX} Update failed: ${err}`, err)
      })
  }

  handleConsoleUninstall ({ extensionId }) {
    this.preventDefault()

    console.log(`${LOG_PREFIX} Uninstalling ${extensionId}...`)
    Promise.resolve()
      .then(() => this._uninstall(extensionId))
      .then(({extension}) => {
        console.log(`${LOG_PREFIX} Uninstall complete ${extension.humanizedIdentifier}`)
      })
      .catch((err) => {
        console.log(`${LOG_PREFIX} Uninstall failed: ${err}`, err)
      })
  }

  handleConsoleList () {
    this.preventDefault()
    const report = []
    report.push(`${LOG_PREFIX} Extensions installed: ${this.installed.size}`)
    this.allInstalled().forEach((extension) => {
      report.push(`    ${extension.humanizedIdentifier}@${extension.version}`)
    })
    console.log(report.join('\n'))
  }
}

export default alt.createStore(ExtensionStore, 'ExtensionStore')
