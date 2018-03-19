import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltCRExtensionIdentifiers'

class CoreCRExtensionActions extends RemoteActions {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get displayName () { return ACTIONS_NAME }

  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () {
    throw new Error('Action not implemented "load"')
  }

  /* **************************************************************************/
  // Install metadata & lifecycle
  /* **************************************************************************/

  /**
  * Accepts new install metadata
  * @param metadata: the metadata
  */
  installMetaChanged (metadata) {
    return { metadata }
  }

  /**
  * Uninstalls an extension
  * @param extensionId: the id of the extension
  */
  uninstallExtension (...args) {
    if (process.type === 'browser') {
      throw new Error('Action not implemented "uninstallExtension"')
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('uninstallExtension', args)
    }
  }

  /**
  * Installs an extension
  * @param extensionId: the id of the extension
  * @param installInfo: the info about the install
  */
  installExtension (...args) {
    if (process.type === 'browser') {
      throw new Error('Action not implemented "installExtension"')
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('installExtension', args)
    }
  }

  /* **************************************************************************/
  // Browser Action
  /* **************************************************************************/

  /**
  * Accepts a new configuration for the browser action
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab
  * @param browserAction: the browser action
  */
  browserActionChanged (extensionId, tabId, browserAction) {
    return { extensionId, tabId, browserAction }
  }

  /**
  * Handles the browser action being clicked
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab when it was clicked
  */
  browserActionClicked (...args) {
    if (process.type === 'browser') {
      throw new Error('Action not implemented "browserActionClicked"')
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('browserActionClicked', args)
    }
  }

  /* **************************************************************************/
  // Settings & Inspect
  /* **************************************************************************/

  /**
  * Opens the extension settings
  * @param extensionId: the id of the extension
  */
  openExtensionOptions (...args) {
    if (process.type === 'browser') {
      throw new Error('Action not implemented "openExtensionOptions"')
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('openExtensionOptions', args)
    }
  }

  /**
  * Opens the background page insepctor
  * @param extensionId: the id of the extension
  */
  inspectBackgroundPage (...args) {
    if (process.type === 'browser') {
      throw new Error('Action not implemented "inspectBackgroundPage"')
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('inspectBackgroundPage', args)
    }
  }

  /* **************************************************************************/
  // Data management
  /* **************************************************************************/

  /**
  * Clears all the browser sessions
  */
  clearAllBrowserSessions (...args) {
    if (process.type === 'browser') {
      throw new Error('Action not implemented "clearAllBrowserSessions"')
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('clearAllBrowserSessions', args)
    }
  }
}

export default CoreCRExtensionActions
