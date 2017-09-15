const CRExtensionDatasource = require('./CRExtensionDatasource')
const CRExtensionBrowserAction = require('./CRExtensionBrowserAction')
const CRExtensionBackgroundPage = require('./CRExtensionBackgroundPage')
const CRExtensionContentScript = require('./CRExtensionContentScript')
const CRExtensionOptionsPage = require('./CRExtensionOptionsPage')
const CRExtensionStorage = require('./CRExtensionStorage')
const CRExtensionContextMenus = require('./CRExtensionContextMenus')
const { CRExtensionI18n } = require('../../../../shared/Models/CRExtension')

class CRExtensionRuntime {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    // APIs first
    this.datasource = new CRExtensionDatasource(extension)
    this.browserAction = new CRExtensionBrowserAction(extension)
    this.contextMenus = new CRExtensionContextMenus(extension)
    this.storage = new CRExtensionStorage(extension)

    // Pages second
    this.backgroundPage = new CRExtensionBackgroundPage(extension)
    this.contentScript = new CRExtensionContentScript(extension)
    this.optionsPage = new CRExtensionOptionsPage(extension)
  }

  destroy () {
    // Pages first
    this.backgroundPage.destroy()
    this.contentScript.destroy()
    this.optionsPage.destroy()

    // APIs second
    this.datasource.destroy()
    this.browserAction.destroy()
    this.contextMenus.destroy()
    this.storage.destroy()
  }

  /* ****************************************************************************/
  // Data state
  /* ****************************************************************************/

  /**
  * Builds the current UI state
  * @return all the config required for the ui
  */
  buildUIRuntimeData () {
    return {
      manifest: this.extension.manifest.cloneData(),
      browserAction: this.browserAction.buildUIRuntimeData(),
      contextMenus: this.contextMenus.buildUIRuntimeData()
    }
  }

  /**
  * Builds the data for the context menu
  * @param language: the language to get the data for
  * @return the config to build context menus all the config required for the ui
  */
  buildUIRuntimeContextMenuData (language) {
    const messages = language ? this.datasource.getMessages(language) : {}
    return {
      extensionId: this.extension.id,
      name: CRExtensionI18n.translateManifestField(messages, this.extension.manifest.name),
      icons: this.extension.manifest.getIconsRelativeTo(this.extension.srcPath),
      contextMenus: this.contextMenus.buildUIRuntimeData()
    }
  }
}

module.exports = CRExtensionRuntime
