import alt from '../alt'

class ExtensionActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

  /* **************************************************************************/
  // Console operations
  /* **************************************************************************/

  /**
  * Installs an extension from the console
  * @param extensionPath: the path of the extension
  */
  consoleInstall (extensionPath) {
    return { extensionPath: extensionPath }
  }

  /**
  * Updates an extension from the console
  * @param extensionPath: the path of the extension
  */
  consoleUpdate (extensionPath) {
    return { extensionPath: extensionPath }
  }

  /**
  * Uninstalls an extension
  * @param extensionId: the id of the extension
  */
  consoleUninstall (extensionId) {
    return { extensionId: extensionId }
  }

  /**
  * Lists the installed extensions
  */
  consoleList () {
    return {}
  }
}

const actions = alt.createActions(ExtensionActions)
window.wavebox = window.wavebox || {}
window.wavebox.extensions = {
  install: function () { actions.consoleInstall.apply(actions, Array.from(arguments)) },
  update: function () { actions.consoleUpdate.apply(actions, Array.from(arguments)) },
  uninstall: function () { actions.consoleUninstall.apply(actions, Array.from(arguments)) },
  list: function () { actions.consoleList.apply(actions, Array.from(arguments)) }
}
export default actions
