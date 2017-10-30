const { remote, ipcRenderer } = require('electron')
const req = require('../req')
const { shell, clipboard, Menu } = remote
const webContents = remote.getCurrentWebContents()
const environment = remote.getCurrentWebContents().getType()
const dictInfo = req.shared('dictionaries.js')
const DictionaryLoad = require('./DictionaryLoad')
const MenuTool = req.shared('Electron/MenuTool')
const {
  WB_MAILBOXES_WINDOW_SHOW_SETTINGS,
  WB_MAILBOXES_WINDOW_CHANGE_PRIMARY_SPELLCHECK_LANG,
  WB_MAILBOXES_WEBVIEW_NAVIGATE_HOME,
  WB_NEW_WINDOW,
  WBECRX_GET_EXTENSION_RUNTIME_CONTEXT_MENU_DATA,
  WBECRX_CONTEXT_MENU_ITEM_CLICKED_
} = req.shared('ipcEvents')
const CRExtensionRTContextMenu = req.shared('Models/CRExtensionRT/CRExtensionRTContextMenu')

class ContextMenu {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get defaultConfig () {
    return {
      // Settings Option
      hasSettingsOption: true,
      hasChangeDictionaryOption: true,

      // External linking
      copyCurrentPageUrlOption: true,
      openCurrentPageInBrowserOption: false,
      openLinkInWaveboxOption: true,

      // Navigation options
      navigateBackOption: false,
      navigateForwardOption: false,
      navigateHomeOption: false,
      navigateReloadOption: false
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param spellchecker=undefined: the spellchecker to use for suggestions
  * @param config={}: the config that can be used to customized the menu. See static.defaultConfig for keys
  */
  constructor (spellchecker = undefined, config = {}) {
    this.spellchecker = spellchecker
    this.config = Object.assign({}, ContextMenu.defaultConfig, config)

    webContents.removeAllListeners('context-menu') // Failure to do this will cause an error on reload
    webContents.on('context-menu', this.launchMenu.bind(this))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders menu items for spelling suggestions
  * @param suggestions: a list of text suggestions
  * @return a list of menu items
  */
  _renderSuggestionMenuItems_ (suggestions) {
    const menuItems = []
    if (suggestions.length) {
      suggestions.forEach((suggestion) => {
        menuItems.push({
          label: suggestion,
          click: () => { webContents.replaceMisspelling(suggestion) }
        })
      })
    } else {
      menuItems.push({ label: 'No Spelling Suggestions', enabled: false })
    }
    return menuItems
  }

  /**
  * Renders the spelling section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderSpellingSection_ (evt, params) {
    const template = []
    if (params.isEditable && params.misspelledWord && this.spellchecker && this.spellchecker.hasSpellchecker) {
      const suggestions = this.spellchecker.suggestions(params.misspelledWord)
      if (suggestions.primary && suggestions.secondary) {
        template.push({
          label: (dictInfo[suggestions.primary.language] || {}).name || suggestions.primary.language,
          submenu: this._renderSuggestionMenuItems_(suggestions.primary.suggestions)
        })
        template.push({
          label: (dictInfo[suggestions.secondary.language] || {}).name || suggestions.secondary.language,
          submenu: this._renderSuggestionMenuItems_(suggestions.secondary.suggestions)
        })
      } else {
        const suggList = (suggestions.primary.suggestions || suggestions.secondary.suggestions || [])
        this._renderSuggestionMenuItems_(suggList).forEach((item) => template.push(item))
      }
    }
    return template
  }

  /**
  * Renders the url section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderURLSection_ (evt, params) {
    const template = []
    if (params.linkURL) {
      template.push({
        label: 'Open Link in Browser',
        click: () => { shell.openExternal(params.linkURL) }
      })
      if (this.config.openLinkInWaveboxOption) {
        template.push({
          label: 'Open Link with Wavebox',
          click: () => { ipcRenderer.sendToHost({ type: WB_NEW_WINDOW, data: { url: params.linkURL } }) }
        })
      }
      if (process.platform === 'darwin') {
        template.push({
          label: 'Open Link in Background',
          click: () => { shell.openExternal(params.linkURL, { activate: false }) }
        })
      }
      template.push({
        label: 'Copy link Address',
        click: () => { clipboard.writeText(params.linkURL) }
      })
    }
    return template
  }

  /**
  * Renders the lookup and search section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderLookupAndSearchSection_ (evt, params) {
    const template = []
    if (params.selectionText) {
      if (params.isEditable && params.misspelledWord && this.spellchecker && this.spellchecker.hasSpellchecker) {
        template.push({
          label: `Add “${params.misspelledWord}” to Dictionary`,
          click: () => { this.spellchecker.addCustomWord(params.misspelledWord) }
        })
      }

      const displayText = params.selectionText.length >= 50 ? (
        params.selectionText.substr(0, 47) + '…'
      ) : params.selectionText
      template.push({
        label: `Search Google for “${displayText}”`,
        click: () => { shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`) }
      })
    }
    return template
  }

  /**
  * Renders the undo/redo section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderRewindSection_ (evt, params) {
    const template = []
    if (params.editFlags.canUndo || params.editFlags.canRedo) {
      template.push({ label: 'Undo', role: 'undo', enabled: params.editFlags.canUndo })
      template.push({ label: 'Redo', role: 'redo', enabled: params.editFlags.canRedo })
    }
    return template
  }

  /**
  * Renders the editing section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderEditingSection_ (evt, params) {
    if (params.mediaType === 'image') { // Image
      return [
        {
          label: 'Open Image in Browser',
          click: () => { shell.openExternal(params.srcURL) }
        },
        {
          label: 'Save Image As…',
          click: () => { webContents.downloadURL(params.srcURL) }
        },
        {
          label: 'Copy Image Address',
          click: () => { clipboard.writeText(params.srcURL) }
        }
      ]
    } else { // Text
      const template = []
      if (params.editFlags.canCut) { template.push({ label: 'Cut', role: 'cut' }) }
      if (params.editFlags.canCopy) { template.push({ label: 'Copy', role: 'copy' }) }
      if (params.editFlags.canPaste) { template.push({ label: 'Paste', role: 'paste' }) }
      if (params.editFlags.canPaste) { template.push({ label: 'Paste and match style', role: 'pasteandmatchstyle' }) }
      if (params.editFlags.canSelectAll) { template.push({ label: 'Select all', role: 'selectall' }) }
      return template
    }
  }

  /**
  * Renders the inpage navigation section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderPageNavigationSection_ (evt, params) {
    const template = []

    if (this.config.navigateHomeOption && environment === 'webview') {
      template.push({
        label: 'Home',
        click: () => { ipcRenderer.sendToHost({ type: WB_MAILBOXES_WEBVIEW_NAVIGATE_HOME }) }
      })
    }
    if (this.config.navigateBackOption) {
      template.push({
        label: 'Go Back',
        enabled: webContents.canGoBack(),
        click: () => webContents.goBack()
      })
    }
    if (this.config.navigateForwardOption) {
      template.push({
        label: 'Go Forward',
        enabled: webContents.canGoForward(),
        click: () => webContents.goForward()
      })
    }
    if (this.config.navigateReloadOption) {
      template.push({
        label: 'Reload',
        click: () => webContents.reload()
      })
    }

    return template
  }

  /**
  * Renders the inpage external open options
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderPageExternalSection_ (evt, params) {
    const template = []
    if (this.config.copyCurrentPageUrlOption) {
      template.push({
        label: 'Copy current URL',
        click: () => { clipboard.writeText(params.pageURL) }
      })
    }
    if (this.config.openCurrentPageInBrowserOption) {
      template.push({
        label: 'Open page in Browser',
        click: () => { shell.openExternal(params.pageURL) }
      })
    }
    return template
  }

  /**
  * Renders the wavebox section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @return the template section or undefined
  */
  _renderWaveboxSection_ (evt, params) {
    const template = []
    if (environment === 'webview') {
      if (this.config.hasSettingsOption) {
        template.push({
          label: 'Wavebox Settings',
          click: () => ipcRenderer.sendToHost({ type: WB_MAILBOXES_WINDOW_SHOW_SETTINGS })
        })
      }

      if (this.config.hasChangeDictionaryOption) {
        const dictionaries = DictionaryLoad.getInstalledDictionaries()
        if (dictionaries.length > 1) {
          const currentLanguage = this.spellchecker ? this.spellchecker.primarySpellcheckerLanguage : null
          template.push({
            label: 'Change Dictionary',
            submenu: dictionaries.map((lang) => {
              return {
                label: (dictInfo[lang] || {}).name || lang,
                type: 'radio',
                checked: lang === currentLanguage,
                click: () => ipcRenderer.sendToHost({ type: WB_MAILBOXES_WINDOW_CHANGE_PRIMARY_SPELLCHECK_LANG, data: { lang: lang } })
              }
            })
          })
        }
      }
    }

    template.push({
      label: 'Inspect',
      click: () => { webContents.inspectElement(params.x, params.y) }
    })
    return template
  }

  /**
  * Renders an extension menu item
  * @param params: the original context menu params
  * @param extensionId: the id of the extension
  * @param menuItem: the runtime context menu to render
  * @return an object that can be passed into the electron templating engine
  */
  _renderExtensionMenuItem_ (params, extensionId, menuItem) {
    if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.NORMAL) {
      return {
        label: menuItem.title,
        enabled: menuItem.enabled,
        click: () => this._handleExtensionOptionClick_(extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.CHECKBOX) {
      return {
        label: menuItem.title,
        type: 'checkbox',
        checked: menuItem.checked,
        click: () => this._handleExtensionOptionClick_(extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.RADIO) {
      return {
        label: menuItem.title,
        type: 'radio',
        checked: menuItem.checked,
        click: () => this._handleExtensionOptionClick_(extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.SEPERATOR) {
      return { type: 'separator' }
    } else {
      return undefined
    }
  }

  /**
  * Renders the wavebox section
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  * @param extensionContextMenus: the data for the context menus
  * @return the template section or undefined
  */
  _renderExtensionSection_ (evt, params, extensionContextMenus) {
    const template = []

    Object.keys(extensionContextMenus).forEach((extensionId) => {
      const { name, icons, contextMenus } = extensionContextMenus[extensionId]
      const validContextMenus = contextMenus
        .filter((menu) => {
          const contexts = new Set(menu.contexts)
          if (contexts.has(CRExtensionRTContextMenu.CONTEXT_TYPES.ALL || CRExtensionRTContextMenu.CONTEXT_TYPES.PAGE)) {
            return true
          } else if (params.isEditable && contexts.has(CRExtensionRTContextMenu.CONTEXT_TYPES.EDITABLE)) {
            return true
          }
        })

      if (validContextMenus.length === 1) {
        template.push(Object.assign({
          icon: remote.nativeImage.createFromPath(icons['16'])
        }, this._renderExtensionMenuItem_(params, extensionId, validContextMenus[0])))
      } else if (validContextMenus.length > 1) {
        template.push({
          label: name,
          icon: remote.nativeImage.createFromPath(icons['16']),
          submenu: validContextMenus.map((menuItem) => this._renderExtensionMenuItem_(params, extensionId, menuItem))
        })
      }
    })

    return template
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles an extension option being clicked by triggering the call upstream
  * @param extensionId: the id of the extension
  * @param menuItem: the menu item that was clicked
  * @param params: the original context menu params
  */
  _handleExtensionOptionClick_ (extensionId, menuItem, params) {
    const upstreamParams = Object.assign({
      menuItemId: menuItem.id,
      parentMenuItemId: menuItem.parentId,
      mediaType: params.mediaType === 'none' ? undefined : params.mediaType,
      linkUrl: params.linkURL,
      srcUrl: params.srcURL,
      pageUrl: params.pageURL,
      frameUrl: params.frameURL,
      selectionText: params.selectionText,
      editable: params.editable
    },
    menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.CHECKBOX || menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.RADIO ? {
      wasChecked: menuItem.checked,
      checked: !menuItem.checked
    } : {})

    const tabId = remote.getCurrentWebContents().id
    ipcRenderer.send(`${WBECRX_CONTEXT_MENU_ITEM_CLICKED_}${extensionId}`, tabId, upstreamParams)
  }

  /* **************************************************************************/
  // Extensions
  /* **************************************************************************/

  /**
  * Makes a sync all up to the main thread for the current context menus for the extensions
  * @return the context menus for each extension
  */
  _getExtensionContextMenus_ () {
    const data = ipcRenderer.sendSync(WBECRX_GET_EXTENSION_RUNTIME_CONTEXT_MENU_DATA)
    Object.keys(data).forEach((extensionId) => {
      data[extensionId].contextMenus = data[extensionId].contextMenus.map(([menuId, menuData]) => {
        return new CRExtensionRTContextMenu(extensionId, menuId, menuData)
      })
    })
    return data
  }

  /* **************************************************************************/
  // Display
  /* **************************************************************************/

  /**
  * Launches the context menu
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  */
  launchMenu (evt, params) {
    const extensionContextMenus = this._getExtensionContextMenus_()
    const sections = [
      this._renderSpellingSection_(evt, params),
      this._renderURLSection_(evt, params),
      this._renderLookupAndSearchSection_(evt, params),
      this._renderRewindSection_(evt, params),
      this._renderEditingSection_(evt, params),
      this._renderPageNavigationSection_(evt, params),
      this._renderPageExternalSection_(evt, params),
      this._renderExtensionSection_(evt, params, extensionContextMenus),
      this._renderWaveboxSection_(evt, params)
    ]
    const template = sections
      .reduce((acc, section) => {
        if (section && section.length) {
          return acc.concat(section, [{ type: 'separator' }])
        } else {
          return acc
        }
      }, [])
      .slice(0, -1)

    const menu = Menu.buildFromTemplate(template)
    menu.popup(remote.getCurrentWindow())
    setTimeout(() => {
      MenuTool.fullDestroyMenu(menu)
    }, 100) // Wait a little just in case
  }
}

module.exports = ContextMenu
