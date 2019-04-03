import { app, BrowserWindow, Menu, shell, clipboard, nativeImage, session } from 'electron'
import { ElectronWebContents } from 'ElectronTools'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import { CRExtensionManager } from 'Extensions/Chrome'
import CRExtensionRTContextMenu from 'shared/Models/CRExtensionRT/CRExtensionRTContextMenu'
import { settingsActions, settingsStore } from 'stores/settings'
import { accountStore, accountActions } from 'stores/account'
import { AUTOFILL_MENU } from 'shared/b64Assets'
import AppSettings from 'shared/Models/Settings/AppSettings'
import {
  WB_READING_QUEUE_LINK_ADDED,
  WB_READING_QUEUE_CURRENT_PAGE_ADDED
} from 'shared/ipcEvents'
import LinkOpener from 'LinkOpener'

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

    const isWaveboxUIContents = contents.session === session.defaultSession
    if (isWaveboxUIContents) {
      this.launchWaveboxMenu(evt, params, browserWindow)
    } else {
      this.launchTabMenu(evt, params, browserWindow)
    }
  }

  /**
  * Launches the menu for a tab
  * @param evt: the event that fired
  * @param params: the parameters to handle the context menu
  * @param browserWindow: the browser window to launch for
  */
  launchTabMenu (evt, params, browserWindow) {
    const contents = evt.sender
    const accountInfo = this.getMenuAccountInfo(evt.sender.id)

    const sections = [
      this.renderSpellingSection(contents, params),
      this.renderURLSection(contents, params, accountInfo),
      this.renderLookupAndSearchSection(contents, params, accountInfo),
      this.renderRewindSection(contents, params),
      this.renderEditingSection(contents, params, false),
      this.renderPageNavigationSection(contents, params, accountInfo),
      this.renderPageExternalSection(contents, params, accountInfo),
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
  * Launches the menu for Wavebox
  * @param evt: the event that fired
  * @param params: the parameters to handle the context menu
  * @param browserWindow: the browser window to launch for
  */
  launchWaveboxMenu (evt, params, browserWindow) {
    const contents = evt.sender
    const accountInfo = { has: false }

    const sections = [
      this.renderSpellingSection(contents, params),
      this.renderLookupAndSearchSection(contents, params, accountInfo),
      this.renderRewindSection(contents, params),
      this.renderEditingSection(contents, params, true)
    ]

    this.presentMenu(browserWindow, sections)
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

  /**
  * Gets the account info for the menu event
  * @param tabId: the id of the tab that called the menu
  * @return { has, mailbox, service }
  */
  getMenuAccountInfo (tabId) {
    const tabMetaInfo = WaveboxWindow.tabMetaInfo(tabId)

    if (!tabMetaInfo) { return { has: false } }
    if (tabMetaInfo.backing !== WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return { has: false } }

    const accountState = accountStore.getState()
    const mailbox = accountState.getMailbox(tabMetaInfo.mailboxId)
    const service = accountState.getService(tabMetaInfo.serviceId)

    if (!mailbox || !service) { return { has: false } }

    return {
      has: true,
      mailbox: mailbox,
      service: service
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the url section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @param accountInfo: the account info from who opened us
  * @return the template section or undefined
  */
  renderURLSection (contents, params, accountInfo) {
    const template = []
    if (params.linkURL) {
      const settingsState = settingsStore.getState()
      const accountState = accountStore.getState()

      template.push({
        label: 'Open Link in Browser',
        click: () => { shell.openExternal(params.linkURL) }
      })
      if (process.platform === 'darwin') {
        template.push({
          label: 'Open Link in Background',
          click: () => { shell.openExternal(params.linkURL, { activate: false }) }
        })
      }
      if (accountInfo.has) {
        template.push({
          label: 'Add Link to Your Tasks',
          click: () => {
            accountActions.addToReadingQueue(accountInfo.service.id, params.linkURL)
            ElectronWebContents.rootWebContents(contents).send(WB_READING_QUEUE_LINK_ADDED, params.linkURL)
          }
        })
      }
      // Look for a simple mailto url in the format mailto:user@user.com. If this is the
      // case remove the mailto: prefix
      const isEmailLink = params.linkURL.startsWith('mailto:') && params.linkURL.indexOf('?') === -1
      template.push({
        label: isEmailLink ? 'Copy Email Address' : 'Copy Link Address',
        click: () => {
          if (isEmailLink) {
            clipboard.writeText(params.linkURL.replace('mailto:', ''))
          } else {
            clipboard.writeText(params.linkURL)
          }
        }
      })
      if (params.linkURL.startsWith('http://') || params.linkURL.startsWith('https://')) {
        template.push({ type: 'separator' })
        template.push({
          label: 'Open Link with Wavebox',
          submenu: [
            {
              label: 'Open Link in New Window',
              click: () => { this.openLinkInWaveboxWindowForAccount(contents, params.linkURL, accountInfo.mailbox.id) }
            },
            (accountInfo.has ? {
              label: 'Open Link as New Service',
              click: () => { accountActions.fastCreateWeblinkService(accountInfo.mailbox.id, params.linkURL) }
            } : undefined),
            {
              label: 'Open Link Here',
              click: () => { contents.loadURL(params.linkURL) }
            }
          ].filter((i) => !!i)
        })
      }

      // Open in account profile
      const mailboxIds = accountState.mailboxIds()
      if (mailboxIds.length > 1) {
        if (settingsState.ui.showCtxMenuAdvancedLinkOptions) {
          template.push({
            label: 'Open Link in Account Profile',
            submenu: mailboxIds.map((mailboxId) => {
              const mailbox = accountState.getMailbox(mailboxId)
              return {
                label: accountState.resolvedMailboxDisplayName(mailboxId),
                submenu: [
                  {
                    label: 'New Window',
                    click: () => {
                      this.openLinkInWaveboxWindowForAccount(contents, params.linkURL, mailboxId)
                    }
                  },
                  { type: 'separator' }
                ].concat(
                  mailbox.allServices.map((serviceId) => {
                    return {
                      label: accountState.resolvedServiceDisplayName(serviceId),
                      click: () => {
                        LinkOpener.openUrlInTopLevelService(serviceId, params.linkURL)
                      }
                    }
                  })
                )
              }
            })
          })
        } else {
          template.push({
            label: 'Open Link in Account Profile',
            submenu: mailboxIds.map((mailboxId) => {
              return {
                label: accountState.resolvedMailboxDisplayName(mailboxId),
                click: () => {
                  this.openLinkInWaveboxWindowForAccount(contents, params.linkURL, mailboxId)
                }
              }
            })
          })
        }
      }
    }
    return template
  }

  /**
  * Renders the lookup and search section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @param accountInfo: the account info from who opened us
  * @return the template section or undefined
  */
  renderLookupAndSearchSection (contents, params, accountInfo) {
    const template = []
    if (params.selectionText && params.inputFieldType !== 'password') {
      if (params.isEditable && params.misspelledWord) {
        template.push({
          label: `Add “${params.misspelledWord}” to Dictionary`,
          click: () => { this[privSpellcheckerService].addUserWord(params.misspelledWord) }
        })
      }

      const settingsState = settingsStore.getState()
      const searchProvider = settingsState.app.searchProvider
      const displayText = params.selectionText.length >= 50 ? (
        params.selectionText.substr(0, 47) + '…'
      ) : params.selectionText
      template.push({
        label: `Search ${AppSettings.SEARCH_PROVIDER_NAMES[searchProvider] || 'The Web'} for “${displayText}”`,
        click: () => {
          const targetUrl = AppSettings.generateSearchProviderUrl(searchProvider, params.selectionText)
          const openInWavebox = AppSettings.searchProviderOpensInWavebox(searchProvider)
          if (openInWavebox && accountInfo.has) {
            this.openLinkInWaveboxWindowForAccount(contents, targetUrl, accountInfo.mailbox.id)
          } else {
            shell.openExternal(targetUrl)
          }
        }
      })
      template.push({
        label: `Translate “${displayText}”`,
        click: () => { shell.openExternal(`http://translate.google.com/#auto/auto/${encodeURIComponent(params.selectionText)}`) }
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
      template.push({
        label: 'Undo',
        click: () => { contents.undo() },
        enabled: params.editFlags.canUndo
      })
      template.push({
        label: 'Redo',
        click: () => { contents.redo() },
        enabled: params.editFlags.canRedo
      })
    }
    return template
  }

  /**
  * Renders the editing section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @param isWaveboxUIContents: true if this is a wavebox ui contents
  * @return the template section or undefined
  */
  renderEditingSection (contents, params, isWaveboxUIContents) {
    if (params.mediaType === 'image') { // Image
      return isWaveboxUIContents ? [] : [
        {
          label: 'Open Image in Browser',
          click: () => { shell.openExternal(params.srcURL) }
        },
        {
          label: 'Save Image As…',
          click: () => { contents.downloadURL(params.srcURL) }
        },
        {
          label: 'Copy Image',
          click: () => {
            if (params.srcURL.startsWith('data:')) {
              clipboard.writeImage(nativeImage.createFromDataURL(params.srcURL))
            } else {
              contents.copyImageAt(params.x, params.y)
            }
          }
        },
        {
          label: 'Copy Image Address',
          click: () => { clipboard.writeText(params.srcURL) }
        }
      ]
    } else if (params.isEditable || params.editFlags.canCopy) { // Textfield or general text
      return [
        params.editFlags.canCut ? {
          label: 'Cut',
          click: () => contents.cut()
        } : undefined,
        params.editFlags.canCopy ? {
          label: 'Copy',
          click: () => contents.copy()
        } : undefined,
        params.editFlags.canPaste ? {
          label: 'Paste',
          click: () => contents.paste()
        } : undefined,
        params.editFlags.canPaste ? {
          label: 'Paste and match style',
          click: () => contents.pasteAndMatchStyle()
        } : undefined,
        params.editFlags.canSelectAll ? {
          label: 'Select all',
          click: () => contents.selectAll()
        } : undefined
      ].filter((i) => !!i)
    } else {
      return []
    }
  }

  /**
  * Renders the in page navigation section
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @param accountInfo: the account info from who opened us
  * @return the template section or undefined
  */
  renderPageNavigationSection (contents, params, accountInfo) {
    if (params.linkURL) { return [] }
    return [
      {
        label: 'Go Back',
        enabled: contents.canGoBack(),
        click: () => { contents.goBack() }
      },
      (contents.canGoForward() ? {
        label: 'Go Forward',
        click: () => { contents.goForward() }
      } : undefined),
      {
        label: 'Reload',
        click: () => { contents.reload() }
      },
      (accountInfo.has ? {
        label: 'Home',
        click: () => { contents.loadURL(accountInfo.service.url) }
      } : undefined)
    ].filter((i) => !!i)
  }

  /**
  * Renders the in page external open options
  * @param contents: the webcontents that opened
  * @param params: the parameters passed alongside the event
  * @param accountInfo: the account info from who opened us
  * @return the template section or undefined
  */
  renderPageExternalSection (contents, params, accountInfo) {
    return [
      {
        label: 'Copy Current URL',
        click: () => { clipboard.writeText(params.pageURL) }
      },
      {
        label: 'Open Page',
        submenu: [
          {
            label: 'Open Page in Browser',
            click: () => { shell.openExternal(params.pageURL) }
          },
          {
            label: 'Open Page in Wavebox',
            click: () => { this.openLinkInWaveboxWindowForAccount(contents, params.pageURL, accountInfo.mailbox.id) }
          },
          (accountInfo.has ? {
            label: 'Open Page as New Service',
            click: () => {
              accountActions.fastCreateWeblinkService(accountInfo.mailbox.id, params.pageURL)
            }
          } : undefined)
        ].filter((i) => !!i)
      },
      (accountInfo.has ? {
        label: 'Add Page to Your Tasks',
        click: () => {
          accountActions.addToReadingQueue(accountInfo.service.id, params.pageURL)
          ElectronWebContents.rootWebContents(contents).send(WB_READING_QUEUE_CURRENT_PAGE_ADDED, params.linkURL)
        }
      } : undefined),
      {
        label: 'Print',
        click: () => { contents.print() }
      }
    ].filter((i) => !!i)
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

      const renderedMenuTemplate = this.renderExtensionMenuTree(contents, params, extensionId, validContextMenus)

      if (renderedMenuTemplate.length === 1) {
        template.push({
          icon: nativeImage.createFromPath(icons['16']),
          ...renderedMenuTemplate[0]
        })
      } else if (validContextMenus.length > 1) {
        template.push({
          label: name,
          icon: nativeImage.createFromPath(icons['16']),
          submenu: renderedMenuTemplate
        })
      }
    })

    return template
  }

  /**
  * Renders an extension menu into the correct tree structure
  * @param contents: the sending webcontents
  * @param params: the original context menu params
  * @param extensionId: the id of the extension
  * @param contextMenus: the context menus to render
  * @return an array that can be used in the template
  */
  renderExtensionMenuTree (contents, params, extensionId, contextMenus) {
    const root = []
    const index = new Map()

    contextMenus.forEach((menuItem) => {
      const rendered = this.renderExtensionMenuItem(contents, params, extensionId, menuItem)
      if (rendered) {
        if (menuItem.parentId && index.get(menuItem.parentId)) {
          const parent = index.get(menuItem.parentId)
          parent.submenu = parent.submenu || []
          parent.submenu.push(rendered)
        } else {
          root.push(rendered)
        }
        index.set(menuItem.id, rendered)
      }
    })

    return root
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
        _id_: menuItem.id,
        label: menuItem.title,
        enabled: menuItem.enabled,
        click: () => this.extensionOptionSelected(contents, extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.CHECKBOX) {
      return {
        _id_: menuItem.id,
        label: menuItem.title,
        type: 'checkbox',
        checked: menuItem.checked,
        click: () => this.extensionOptionSelected(contents, extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.RADIO) {
      return {
        _id_: menuItem.id,
        label: menuItem.title,
        type: 'radio',
        checked: menuItem.checked,
        click: () => this.extensionOptionSelected(contents, extensionId, menuItem, params)
      }
    } else if (menuItem.type === CRExtensionRTContextMenu.ITEM_TYPES.SEPARATOR) {
      return { type: 'separator' }
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  *  Opens a link in a Wavebox popup window, backed for a different account type
  * @param contents: the contents to open for
  * @param url: the url to open
  * @param mailboxId: the id of the mailbox to open for
  */
  openLinkInWaveboxWindowForAccount (contents, url, mailboxId) {
    const rootContents = ElectronWebContents.rootWebContents(contents)
    const openerWindow = rootContents ? BrowserWindow.fromWebContents(rootContents) : undefined
    LinkOpener.openUrlInMailboxWindow(mailboxId, url, openerWindow)
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
