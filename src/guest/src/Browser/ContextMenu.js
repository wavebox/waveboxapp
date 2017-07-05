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
  WB_MAILBOXES_WEBVIEW_NAVIGATE_HOME
} = req.shared('ipcEvents')

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
      copyCurrentPageUrlOption: false,
      openCurrentPageInBrowserOption: false,

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
  // Menu
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
  * Launches the context menu
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  */
  launchMenu (evt, params) {
    const menuTemplate = []

    // Spelling suggestions
    if (params.isEditable && params.misspelledWord && this.spellchecker && this.spellchecker.hasSpellchecker) {
      const suggestions = this.spellchecker.suggestions(params.misspelledWord)
      if (suggestions.primary && suggestions.secondary) {
        menuTemplate.push({
          label: (dictInfo[suggestions.primary.language] || {}).name || suggestions.primary.language,
          submenu: this._renderSuggestionMenuItems_(suggestions.primary.suggestions)
        })
        menuTemplate.push({
          label: (dictInfo[suggestions.secondary.language] || {}).name || suggestions.secondary.language,
          submenu: this._renderSuggestionMenuItems_(suggestions.secondary.suggestions)
        })
      } else {
        const suggList = (suggestions.primary.suggestions || suggestions.secondary.suggestions || [])
        this._renderSuggestionMenuItems_(suggList).forEach((item) => menuTemplate.push(item))
      }
      menuTemplate.push({ type: 'separator' })
    }

    // URLS
    if (params.linkURL) {
      menuTemplate.push({
        label: 'Open Link',
        click: () => { shell.openExternal(params.linkURL) }
      })
      if (process.platform === 'darwin') {
        menuTemplate.push({
          label: 'Open Link in Background',
          click: () => { shell.openExternal(params.linkURL, { activate: false }) }
        })
      }
      menuTemplate.push({
        label: 'Copy link Address',
        click: () => { clipboard.writeText(params.linkURL) }
      })
      menuTemplate.push({ type: 'separator' })
    }

    // Lookup & search
    if (params.selectionText) {
      if (params.isEditable && params.misspelledWord && this.spellchecker && this.spellchecker.hasSpellchecker) {
        menuTemplate.push({
          label: `Add “${params.misspelledWord}” to Dictionary`,
          click: () => { this.spellchecker.addCustomWord(params.misspelledWord) }
        })
      }

      const displayText = params.selectionText.length >= 50 ? (
        params.selectionText.substr(0, 47) + '…'
      ) : params.selectionText
      menuTemplate.push({
        label: `Search Google for “${displayText}”`,
        click: () => { shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`) }
      })
      menuTemplate.push({ type: 'separator' })
    }

    // Editing
    const {
      canUndo,
      canRedo,
      canCut,
      canCopy,
      canPaste,
      canSelectAll
    } = params.editFlags

    // Undo / redo
    if (canUndo || canRedo) {
      menuTemplate.push({ label: 'Undo', role: 'undo', enabled: canUndo })
      menuTemplate.push({ label: 'Redo', role: 'redo', enabled: canRedo })
      menuTemplate.push({ type: 'separator' })
    }

    // Text editing
    const textEditingMenu = [
      canCut ? { label: 'Cut', role: 'cut' } : null,
      canCopy ? { label: 'Copy', role: 'copy' } : null,
      canPaste ? { label: 'Paste', role: 'paste' } : null,
      canPaste ? { label: 'Paste and match style', role: 'pasteandmatchstyle' } : null,
      canSelectAll ? { label: 'Select all', role: 'selectall' } : null
    ].filter((item) => item !== null)
    if (textEditingMenu.length) {
      textEditingMenu.forEach((item) => menuTemplate.push(item))
      menuTemplate.push({ type: 'separator' })
    }

    // In page navigation
    const inPageNavigation = [
      this.config.navigateHomeOption && environment === 'webview' ? {
        label: 'Home',
        click: () => { ipcRenderer.sendToHost({ type: WB_MAILBOXES_WEBVIEW_NAVIGATE_HOME }) }
      } : undefined,
      this.config.navigateBackOption ? {
        label: 'Go Back',
        enabled: webContents.canGoBack(),
        click: () => webContents.goBack()
      } : undefined,
      this.config.navigateForwardOption ? {
        label: 'Go Forward',
        enabled: webContents.canGoForward(),
        click: () => webContents.goForward()
      } : undefined,
      this.config.navigateReloadOption ? {
        label: 'Reload',
        click: () => webContents.reload()
      } : undefined
    ].filter((item) => !!item)
    if (inPageNavigation.length) {
      menuTemplate.splice(Infinity, 0, ...inPageNavigation)
      menuTemplate.push({ type: 'separator' })
    }

    // Current Page
    const currentPageOptions = [
      this.config.copyCurrentPageUrlOption ? {
        label: 'Copy current URL',
        click: () => { clipboard.writeText(window.location.href) }
      } : undefined,
      this.config.openCurrentPageInBrowserOption ? {
        label: 'Open page in Browser',
        click: () => { shell.openExternal(window.location.href) }
      } : undefined
    ].filter((item) => !!item)
    if (currentPageOptions.length) {
      menuTemplate.splice(Infinity, 0, ...currentPageOptions)
      menuTemplate.push({ type: 'separator' })
    }

    // Wavebox
    if (environment === 'webview') {
      if (this.config.hasSettingsOption) {
        menuTemplate.push({
          label: 'Wavebox Settings',
          click: () => ipcRenderer.sendToHost({ type: WB_MAILBOXES_WINDOW_SHOW_SETTINGS })
        })
      }
      if (this.config.hasChangeDictionaryOption) {
        const dictionaries = DictionaryLoad.getInstalledDictionaries()
        if (dictionaries.length > 1) {
          const currentLanguage = this.spellchecker ? this.spellchecker.primarySpellcheckerLanguage : null
          menuTemplate.push({
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
    menuTemplate.push({
      label: 'Inspect',
      click: () => { webContents.inspectElement(params.x, params.y) }
    })
    const menu = Menu.buildFromTemplate(menuTemplate)
    menu.popup(remote.getCurrentWindow())
    setTimeout(() => {
      MenuTool.fullDestroyMenu(menu)
    }, 100) // just in case
  }
}

module.exports = ContextMenu
