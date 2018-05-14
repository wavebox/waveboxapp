import Runtime from 'Runtime/Runtime'
import Extension from './Extension'
import I18n from './I18n'
import Storage from 'Storage'
import ContextMenus from './ContextMenus'
import BrowserAction from './BrowserAction'
import Tabs from 'Tabs/Tabs'
import App from './App'
import Omnibox from './Omnibox'
import Management from './Management'
import WebRequest from 'WebRequest'
import Notifications from './Notifications'
import Cookies from './Cookies/Cookies'
import Windows from './Windows'
import Permissions from './Permissions'
import { CR_RUNTIME_ENVIRONMENTS } from 'shared/extensionApis'

class Chrome {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @param runtimeEnvironment: the environemtn we're running in
  * @param extensionDatasource: the datasource to use
  */
  constructor (extensionId, runtimeEnvironment, extensionDatasource) {
    const permissions = extensionDatasource.manifest.permissions

    this.runtime = new Runtime(extensionId, runtimeEnvironment, extensionDatasource)
    this.extension = new Extension(extensionId, runtimeEnvironment, this.runtime)
    this.i18n = new I18n(extensionId, extensionDatasource)

    if (permissions.has('storage')) {
      this.storage = new Storage(extensionId, runtimeEnvironment, this.runtime)
    }

    if (runtimeEnvironment !== CR_RUNTIME_ENVIRONMENTS.CONTENTSCRIPT) {
      this.browserAction = new BrowserAction(extensionId)
      this.tabs = new Tabs(extensionId, runtimeEnvironment, permissions.has('tabs'))
      this.windows = new Windows(extensionId, permissions.has('tabs'))
      this.app = new App(extensionId, extensionDatasource)
      this.omnibox = new Omnibox(extensionId)
      this.permissions = new Permissions(extensionId, extensionDatasource)

      if (permissions.has('contextMenus')) {
        this.contextMenus = new ContextMenus(extensionId, this.runtime)
      }
      if (permissions.has('management')) {
        this.management = new Management(extensionId)
      }
      if (permissions.has('webRequest')) {
        this.webRequest = new WebRequest(extensionId)
      }
      if (permissions.has('notifications')) {
        this.notifications = new Notifications(extensionId)
      }
      if (permissions.has('cookies')) {
        this.cookies = new Cookies(extensionId, this.runtime)
      }
    }

    Object.freeze(this)
  }
}

export default Chrome
