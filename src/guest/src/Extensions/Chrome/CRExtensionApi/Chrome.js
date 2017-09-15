const Runtime = require('./Runtime/Runtime')
const Extension = require('./Extension')
const ContextMenus = require('./ContextMenus')
const I18n = require('./I18n')
const BrowserAction = require('./BrowserAction')
const ExtensionDatasource = require('./Core/ExtensionDatasource')
const Tabs = require('./Tabs/Tabs')
const App = require('./App')
const Storage = require('./Storage')
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
    const extensionDatasource = new ExtensionDatasource(extensionId)

    this.runtime = new Runtime(extensionId, runtimeEnvironment, extensionDatasource)
    this.extension = new Extension(extensionId, runtimeEnvironment, this.runtime)
    this.contextMenus = new ContextMenus(extensionId, this.runtime)
    this.browserAction = new BrowserAction(extensionId)
    this.tabs = new Tabs(extensionId, runtimeEnvironment)
    this.app = new App(extensionId, extensionDatasource)
    if (runtimeEnvironment !== CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT) {
      this.i18n = new I18n(extensionId, extensionDatasource)
      this.storage = new Storage(extensionId, runtimeEnvironment, this.runtime)
    }
    Object.freeze(this)
  }
}

module.exports = Chrome
