import {
  app,
  BrowserWindow,
  Menu,
  shell,
  clipboard,
  nativeImage
} from 'electron'
import { ElectronWebContents } from 'ElectronTools'
import WaveboxWindow from 'Windows/WaveboxWindow'
import ContentWindow from 'Windows/ContentWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import { CRExtensionManager } from 'Extensions/Chrome'
import CRExtensionRTContextMenu from 'shared/Models/CRExtensionRT/CRExtensionRTContextMenu'
import { settingsActions } from 'stores/settings'
import { accountStore } from 'stores/account'
import { AUTOFILL_MENU } from 'shared/b64Assets'

const privConnected = Symbol('privConnected')
const privSpellcheckerService = Symbol('privSpellcheckerService')
const privAutofillService = Symbol('privAutofillService')

class ContextMenuService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  *  @param spellcheckService: the spellchecker service to use
  * @param autofillService: the autofill service to use
  */
  constructor (spellcheckService, autofillService) {
    this[privSpellcheckerService] = spellcheckService
    this[privAutofillService] = autofillService
    this[privConnected] = new Set()

    app.on('web-contents-created', this._handleWebContentsCreated)
    app.on('browser-window-created', this._handleBrowserWindowCreated)
  }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles a browser window being created by binding patching through to the
  * webcontents call. We do this because sometimes a WC is created but not yet
  * attached to a browser window, meaning the menu wont be bound
  * @param evt: the event that fired
  * @param window: the window that was created
  */
  _handleBrowserWindowCreated = (evt, window) => {
    this._handleWebContentsCreated(evt, window.webContents)
  }

  /**
  * Handles a webcontents being created by binding the context menu to it
  * @param evt: the event that fired
  * @param contents: the contents that were created
  */
  _handleWebContentsCreated = (evt, contents) => {
    setImmediate(() => {
      if (contents.isDestroyed()) { return }
      const webContentsId = contents.id
      if (this[privConnected].has(webContentsId)) { return }

      // Check we're suitable
      const rootContents = ElectronWebContents.rootWebContents(contents)
      if (!rootContents) { return }
      const browserWindow = BrowserWindow.fromWebContents(rootContents)
      if (!browserWindow) { return }
      const waveboxWindow = WaveboxWindow.fromBrowserWindow(browserWindow)
      if (waveboxWindow) {
        if (!waveboxWindow.rootWebContentsHasContextMenu && waveboxWindow.rootWebContentsId === webContentsId) { return }
      }

      // Bind
      this[privConnected].add(webContentsId)
      contents.on('context-menu', this.launchMenu)
      contents.on('destroyed', () => {
        this[privConnected].delete(webContentsId)
      })
    })
  }

  /* ****************************************************************************/
  // Context Menu events
  /* ****************************************************************************/

  /**
  * Binds the context menu to the given webContents
  * @param evt: the event that fired
  * @param params: the parameters to handle the context menu
  */
  launchMenu = (evt, params) => {
    const contents = evt.sender
    const rootContents = ElectronWebContents.rootWebContents(contents)
    if (!rootContents) { return }
    const browserWindow = BrowserWindow.fromWebContents(rootContents)
    if (!browserWindow) { return }

    const sections = [
      this.renderSpellingSection(contents, params),
      this.renderURLSection(contents, params),
      this.renderLookupAndSearchSection(contents, params),
      this.renderRewindSection(contents, params),
      this.renderEditingSection(contents, params),
      this.renderPageNavigationSection(contents, params),
      this.renderPageExternalSection(contents, params),
      this.renderExtensionSection(contents, params),
      this.renderWaveboxSection(contents, params)
    ]

    if (this[privAutofillService].isAvailable && this[privAutofillService].isValidAutofillUrl(evt.sender.getURL()) && this.isAutofillPasswordField(contents, params)) {
      this[privAutofillService]
        .findCredentials(contents.getURL())
        .then((credentials) => {
          this.presentMenu(browserWindow, [
            this.renderAutofillSection(contents, params, credentials)
          ].concat(sections))
        })
        .catch(() => {
          // If we end in an error state it could be because the lib is not working on this machine.
          // In this case, just present the normal menu
          this.presentMenu(browserWindow, sections)
        })
    } else {
      this.presentMenu(browserWindow, sections)
    }
  }

  /**
  * Presents the menu
  * @param browserWindow: the browser window to present on
  * @param sections: the sections to render
  */
  presentMenu (browserWindow, sections) {
    const menu = Menu.buildFromTemplate(this.convertSectionsToTemplate(sections))
    menu.popup({
      window: browserWindow,
      callback: () => { menu.destroy() }
    })
  }

  /**
  * Converts a list of section templates a complete menu template
  * @param sections: the sections to build the template with
  * @return a full template for the menu builder
  */
  convertSectionsToTemplate (sections) {
    return sections
      .reduce((acc, section) => {
        if (section && section.length) {
          return acc.concat(section, [{ type: 'separator' }])
        } else {
          return acc
        }
      }, [])
      .slice(0, -1)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the url section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderURLSection (contents, params) {
    const template = []
    if (params.linkURL) {
      template.push({
        label: 'Open Link in Browser',
        click: () => { shell.openExternal(params.linkURL) }
      })
      template.push({
        label: 'Open Link with Wavebox',
        click: () => { this.openLinkInWaveboxWindow(contents, params.linkURL) }
      })

      const accountState = accountStore.getState()
      const mailboxIds = accountState.mailboxIds()
      if (mailboxIds.length > 1) {
        template.push({
          label: 'Open Link in Account Profile',
          submenu: mailboxIds.map((mailboxId) => {
            return {
              label: accountState.resolvedMailboxDisplayName(mailboxId),
              click: () => {
                this.openLinkInWaveboxWindowForAccount(
                  contents,
                  params.linkURL,
                  accountStore.getState().getMailbox(mailboxId)
                )
              }
            }
          })
        })
      }

      template.push({
        label: 'Open Link in Current Tab',
        click: () => { contents.loadURL(params.linkURL) }
      })
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
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderLookupAndSearchSection (contents, params) {
    const template = []
    if (params.selectionText) {
      if (params.isEditable && params.misspelledWord) {
        template.push({
          label: `Add “${params.misspelledWord}” to Dictionary`,
          click: () => { this[privSpellcheckerService].addUserWord(params.misspelledWord) }
        })
      }

      const displayText = params.selectionText.length >= 50 ? (
        params.selectionText.substr(0, 47) + '…'
      ) : params.selectionText
      template.push({
        label: `Search Google for “${displayText}”`,
        click: () => { shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`) }
      })
      template.push({
        label: `Translate “${displayText}”`,
        click: () => { shell.openExternal(`http://translate.google.com/#auto/#/${encodeURIComponent(params.selectionText)}`) }
      })
    }
    return template
  }

  /**
  * Renders the undo/redo section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderRewindSection (contents, params) {
    const template = []
    if (params.editFlags.canUndo || params.editFlags.canRedo) {
      template.push({ label: 'Undo', role: 'undo', enabled: params.editFlags.canUndo })
      template.push({ label: 'Redo', role: 'redo', enabled: params.editFlags.canRedo })
    }
    return template
  }

  /**
  * Renders the editing section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderEditingSection (contents, params) {
    if (params.mediaType === 'image') { // Image
      return [
        {
          label: 'Open Image in Browser',
          click: () => { shell.openExternal(params.srcURL) }
        },
        {
          label: 'Save Image As…',
          click: () => { contents.downloadURL(params.srcURL) }
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
  * Renders the in page navigation section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderPageNavigationSection (contents, params) {
    return [
      {
        label: 'Go Back',
        enabled: contents.canGoBack(),
        click: () => contents.goBack()
      },
      {
        label: 'Go Forward',
        enabled: contents.canGoForward(),
        click: () => contents.goForward()
      },
      {
        label: 'Reload',
        click: () => contents.reload()
      }
    ]
  }

  /**
  * Renders the in page external open options
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderPageExternalSection (contents, params) {
    return [
      {
        label: 'Copy current URL',
        click: () => { clipboard.writeText(params.pageURL) }
      },
      {
        label: 'Open page in Browser',
        click: () => { shell.openExternal(params.pageURL) }
      },
      {
        label: 'Open page with Wavebox',
        click: () => { this.openLinkInWaveboxWindow(contents, params.pageURL) }
      }
    ]
  }

  /**
  * Renders the wavebox section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderWaveboxSection (contents, params) {
    const template = []

    template.push({
      label: 'Wavebox Settings',
      click: () => { this.openWaveboxSettings(contents) }
    })

    const installedDictionaries = this[privSpellcheckerService].getInstalledDictionaries()
    if (installedDictionaries.length > 1) {
      const currentLanguage = this[privSpellcheckerService].primaryLanguage
      template.push({
        label: 'Change Dictionary',
        submenu: installedDictionaries.map((lang) => {
          return {
            label: this[privSpellcheckerService].getHumanizedLanguageName(lang),
            type: 'radio',
            checked: lang === currentLanguage,
            click: () => {
              settingsActions.sub.language.setSpellcheckerLanguage(lang)
            }
          }
        })
      })
    }

    template.push({
      label: 'Inspect',
      click: () => { contents.inspectElement(params.x, params.y) }
    })
    return template
  }

  /* **************************************************************************/
  // Rendering: Spelling
  /* **************************************************************************/

  /**
  * Renders the spelling section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderSpellingSection (contents, params) {
    const template = []
    if (params.isEditable && params.misspelledWord) {
      const suggestions = this[privSpellcheckerService].spellSuggestionsSync(params.misspelledWord)
      if (suggestions.primary && suggestions.secondary) {
        template.push({
          label: this[privSpellcheckerService].getHumanizedLanguageName(suggestions.primary.language),
          submenu: this.renderSpellingSuggestionMenuItems(contents, suggestions.primary.suggestions)
        })
        template.push({
          label: this[privSpellcheckerService].getHumanizedLanguageName(suggestions.secondary.language),
          submenu: this.renderSpellingSuggestionMenuItems(contents, suggestions.secondary.suggestions)
        })
      } else {
        const primary = (suggestions.primary || {}).suggestions
        const secondary = (suggestions.secondary || {}).suggestions
        const suggList = primary || secondary || []
        this.renderSpellingSuggestionMenuItems(contents, suggList).forEach((item) => template.push(item))
      }
    }
    return template
  }

  /**
  * Renders menu items for spelling suggestions
  * @param contents: the webcontents that opened
  * @param suggestions: a list of text suggestions
  * @return a list of menu items
  */
  renderSpellingSuggestionMenuItems (contents, suggestions) {
    const menuItems = []
    if (suggestions.length) {
      suggestions.forEach((suggestion) => {
        menuItems.push({
          label: suggestion,
          click: () => { contents.replaceMisspelling(suggestion) }
        })
      })
    } else {
      menuItems.push({ label: 'No Spelling Suggestions', enabled: false })
    }
    return menuItems
  }

  /* **************************************************************************/
  // Rendering: Autofill
  /* **************************************************************************/

  /**
  * Checks to see if this is an enabled autofill password field
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return true if it's enabled for autofill
  */
  isAutofillPasswordField (contents, params) {
    if (params.inputFieldType !== 'password') { return false }
    if (!params.isEditable) { return false }
    if (!contents.getURL().startsWith('https://')) { return false }

    return true
  }

  /**
  * Renders the autofill section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @param credentials: the credentials
  * @return the template section or undefined
  */
  renderAutofillSection (contents, params, credentials) {
    if (!this.isAutofillPasswordField(contents, params)) { return undefined }

    return credentials
      .map((rec) => {
        return {
          icon: nativeImage.createFromDataURL(AUTOFILL_MENU),
          label: rec.account,
          click: () => {
            // contents.insertText seems to insert the text 3 times on linux and Windows.
            // Using replace doesn't have this problem
            contents.selectAll()
            contents.replace(rec.password)
            contents.unselect()
          }
        }
      })
      .concat([
        {
          label: 'Manage saved passwords',
          click: () => { this[privAutofillService].openAutofillManager(contents.getURL()) }
        },
        {
          label: 'Add new password',
          click: () => { this[privAutofillService].addAutofillPassword(contents.getURL()) }
        }
      ])
  }

  /* **************************************************************************/
  // Rendering: Extensions
  /* **************************************************************************/

  /**
  * Renders the wavebox section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @return the template section or undefined
  */
  renderExtensionSection (contents, params) {
    // Check we're in a recognized tab - extensions don't work universally for us on purpose!
    const waveboxWindow = WaveboxWindow.fromTabId(contents.id)
    if (!waveboxWindow) { return [] }

    // Munge the data a little bit to make it easier to work with
    const extensionContextMenus = CRExtensionManager.runtimeHandler.getRuntimeContextMenuData()
    Object.keys(extensionContextMenus).forEach((extensionId) => {
      extensionContextMenus[extensionId].contextMenus = extensionContextMenus[extensionId].contextMenus.map(([menuId, menuData]) => {
        return new CRExtensionRTContextMenu(extensionId, menuId, menuData)
      })
    })

    // Start building the template
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
          icon: nativeImage.createFromPath(icons['16'])
        }, this.renderExtensionMenuItem(contents, params, extensionId, validContextMenus[0])))
      } else if (validContextMenus.length > 1) {
        template.push({
          label: name,
          icon: nativeImage.createFromPath(icons['16']),
          submenu: validContextMenus.map((menuItem) => this.renderExtensionMenuItem(contents, params, extensionId, menuItem))
        })
      }
    })

    return template
  }

  /**
  * Renders an extension menu item
  * @param contents: the sending webcontents
  * @param params: the original context menu params
  * @param extensionId: the id of the extension
  * @param menuItem: the runtime context menu to render
  * @return an object that can be passed into the electron templating engine
  */
  renderExtensionMenuItem (contents, params, extensionId, menuItem) {
    if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.NORMAL) {
      return {
        label: menuItem.title,
        enabled: menuItem.enabled,
        click: () => this.extensionOptionSelected(contents, extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.CHECKBOX) {
      return {
        label: menuItem.title,
        type: 'checkbox',
        checked: menuItem.checked,
        click: () => this.extensionOptionSelected(contents, extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.RADIO) {
      return {
        label: menuItem.title,
        type: 'radio',
        checked: menuItem.checked,
        click: () => this.extensionOptionSelected(contents, extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.SEPERATOR) {
      return { type: 'separator' }
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens a link in a Wavebox popup window
  * @param contents: the contents to open for
  * @param url: the url to open
  */
  openLinkInWaveboxWindow (contents, url) {
    const rootContents = ElectronWebContents.rootWebContents(contents)
    const openerWindow = rootContents ? BrowserWindow.fromWebContents(rootContents) : undefined
    const waveboxWindow = WaveboxWindow.fromBrowserWindow(openerWindow)

    const openerWebPreferences = contents.getWebPreferences()
    const contentWindow = new ContentWindow(waveboxWindow ? waveboxWindow.tabMetaInfo(contents.id) : undefined)
    contentWindow.create(
      url,
      undefined,
      openerWindow,
      { partition: openerWebPreferences.partition }
    )
  }

  /**
  *  Opens a link in a Wavebox popup window, backed for a different account type
  * @param contents: the contents to open for
  * @param url: the url to open
  * @param mailbox: the mailbox to open for
  */
  openLinkInWaveboxWindowForAccount (contents, url, mailbox) {
    const rootContents = ElectronWebContents.rootWebContents(contents)
    const openerWindow = rootContents ? BrowserWindow.fromWebContents(rootContents) : undefined
    const contentWindow = new ContentWindow(
      undefined // This is a hived window, so don't pass any meta info into it
    )
    contentWindow.create(
      url,
      undefined,
      openerWindow,
      { partition: mailbox.partitionId }
    )
  }

  /**
  * Opens the wavebox settings
  * @param contents: the contents to open for
  */
  openWaveboxSettings (contents) {
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    if (mailboxesWindow) {
      mailboxesWindow.show().focus().launchPreferences()
    }
  }

  /**
  * Handles an extension option being clicked by triggering the call upstream
  * @param contents: the sending contents
  * @param extensionId: the id of the extension
  * @param menuItem: the menu item that was clicked
  * @param params: the original context menu params
  */
  extensionOptionSelected (contents, extensionId, menuItem, params) {
    if (contents.isDestroyed()) { return }

    const clickParams = Object.assign({
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
    CRExtensionManager.runtimeHandler.contextMenuItemSelected(extensionId, contents, clickParams)
  }
}

export default ContextMenuService
