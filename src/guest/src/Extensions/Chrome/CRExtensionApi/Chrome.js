const Runtime = require('./Runtime/Runtime')
const Extension = require('./Extension')
const I18n = require('./I18n')
const ExtensionDatasource = require('./Core/ExtensionDatasource')
const req = require('../../../req')
const {
  CR_RUNTIME_ENVIRONMENTS
} = req.shared('extensionApis')

class Chrome {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the environemtn we're running in
  */
  constructor (extensionId, runtimeEnvironment) {
    // Late require some libs as if they're not required
    // it's just a waste parsing them
    const extensionDatasource = new ExtensionDatasource(extensionId)
    const permissions = extensionDatasource.manifest.permissions

    this.runtime = new Runtime(extensionId, runtimeEnvironment, extensionDatasource)
    this.extension = new Extension(extensionId, runtimeEnvironment, this.runtime)
    this.i18n = new I18n(extensionId, extensionDatasource)
    if (permissions.has('storage')) {
      const Storage = require('./Storage')
      this.storage = new Storage(extensionId, runtimeEnvironment, this.runtime)
    }

    if (runtimeEnvironment !== CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT) {
      if (permissions.has('contextMenus')) {
        const ContextMenus = require('./ContextMenus')
        this.contextMenus = new ContextMenus(extensionId, this.runtime)
      }

      const BrowserAction = require('./BrowserAction')
      this.browserAction = new BrowserAction(extensionId)

      const Tabs = require('./Tabs/Tabs')
      this.tabs = new Tabs(extensionId, runtimeEnvironment, permissions.has('tabs'))

      const App = require('./App')
      this.app = new App(extensionId, extensionDatasource)

      if (permissions.has('management')) {
        const Management = require('./Management')
        this.management = new Management(extensionId)
      }
    }

    Object.freeze(this)
  }
}

module.exports = Chrome
