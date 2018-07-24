import { Menu, globalShortcut, app, BrowserWindow } from 'electron'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import MenuTool from 'shared/Electron/MenuTool'
import { evtMain } from 'AppEvents'
import { toKeyEvent } from 'keyboardevent-from-electron-accelerator'
import WaveboxAppPrimaryMenuActions from './WaveboxAppPrimaryMenuActions'

class WaveboxAppPrimaryMenu {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this._lastAccelerators = null
    this._lastMailboxMenuConfig = null
    this._lastUserEmail = null
    this._lastMenu = null
    this._hiddenShortcuts = new Map()

    accountStore.listen(this.handleMailboxesChanged)
    settingsStore.listen(this.handleAcceleratorsChanged)
    userStore.listen(this.handleUserChanged)
    evtMain.on(evtMain.INPUT_EVENT_PREVENTED, this.handleInputEventPrevented)
    app.on('browser-window-focus', this.bindHiddenShortcuts)
    app.on('browser-window-blur', this.unbindHiddenShortcuts)
  }

  /* ****************************************************************************/
  // Creating
  /* ****************************************************************************/

  /**
  * Builds the menu
  * @param accelerators: the accelerators to use
  * @param mailboxMenuConfig: the mailbox menu config
  * @param userEmail: the users email address
  * @return the new menu
  */
  build (accelerators, mailboxMenuConfig, userEmail) {
    // Fixes https://github.com/wavebox/waveboxapp/issues/562
    const tlpfx = process.platform === 'linux' ? '&' : ''

    return Menu.buildFromTemplate([
      {
        label: process.platform === 'darwin' ? `${tlpfx}Application` : `${tlpfx}File`,
        submenu: [
          {
            label: userEmail ? `Wavebox Account: ${userEmail}` : 'Wavebox Account: Logged out',
            click: WaveboxAppPrimaryMenuActions.waveboxAccount
          },
          { type: 'separator' },
          {
            label: 'About',
            click: WaveboxAppPrimaryMenuActions.aboutDialog
          },
          {
            label: 'Check for Update',
            click: WaveboxAppPrimaryMenuActions.checkForUpdate
          },
          { type: 'separator' },
          {
            label: 'Compose',
            click: WaveboxAppPrimaryMenuActions.composeMail,
            accelerator: accelerators.composeMail
          },
          {
            label: 'Compose in current tab',
            click: WaveboxAppPrimaryMenuActions.composeMailHere,
            accelerator: accelerators.composeMailHere
          },
          { type: 'separator' },
          {
            label: 'Add Account',
            click: WaveboxAppPrimaryMenuActions.addAccount
          },
          {
            label: 'Preferences',
            click: WaveboxAppPrimaryMenuActions.preferences,
            accelerator: accelerators.preferences
          },
          { type: 'separator' },
          process.platform === 'darwin' ? { label: 'Services', role: 'services', submenu: [] } : undefined,
          process.platform === 'darwin' ? { type: 'separator' } : undefined,
          {
            label: 'Close Window',
            click: WaveboxAppPrimaryMenuActions.closeWindow,
            accelerator: accelerators.closeWindow
          },
          process.platform === 'darwin' ? {
            label: 'Hide Wavebox',
            role: 'hide',
            accelerator: accelerators.hide
          } : {
            label: 'Hide Window',
            click: WaveboxAppPrimaryMenuActions.hideAll,
            accelerator: accelerators.hide
          },
          process.platform === 'darwin' ? {
            label: 'Hide Others',
            role: 'hideothers',
            accelerator: accelerators.hideOthers
          } : undefined,
          process.platform === 'darwin' ? {
            label: 'Show All',
            role: 'unhide'
          } : {
            label: 'Show All',
            click: WaveboxAppPrimaryMenuActions.showAll
          },
          { type: 'separator' },
          {
            label: 'Quit',
            click: WaveboxAppPrimaryMenuActions.fullQuit,
            accelerator: accelerators.quit
          }
        ].filter((item) => item !== undefined)
      },
      {
        label: `${tlpfx}Edit`,
        submenu: [
          {
            label: 'Undo',
            role: 'undo',
            accelerator: accelerators.undo
          },
          {
            label: 'Redo',
            role: 'redo',
            accelerator: accelerators.redo
          },
          { type: 'separator' },
          {
            label: 'Cut',
            role: 'cut',
            accelerator: accelerators.cut
          },
          {
            label: 'Copy',
            role: 'copy',
            accelerator: accelerators.copy
          },
          {
            label: 'Paste',
            role: 'paste',
            accelerator: accelerators.paste
          },
          {
            label: 'Paste and match style',
            role: 'pasteandmatchstyle',
            accelerator: accelerators.pasteAndMatchStyle
          },
          {
            label: 'Select All',
            role: 'selectall',
            accelerator: accelerators.selectAll
          },
          { type: 'separator' },
          {
            label: 'Copy Current Tab URL',
            click: WaveboxAppPrimaryMenuActions.copyCurrentTabUrl,
            accelerator: accelerators.copyCurrentTabUrl
          },
          { type: 'separator' },
          {
            label: 'Find',
            click: WaveboxAppPrimaryMenuActions.find,
            accelerator: accelerators.find
          },
          {
            label: 'Find Next',
            click: WaveboxAppPrimaryMenuActions.findNext,
            accelerator: accelerators.findNext
          }
        ]
      },
      {
        label: `${tlpfx}View`,
        submenu: [
          {
            label: 'Toggle Full Screen',
            click: WaveboxAppPrimaryMenuActions.fullscreenToggle,
            accelerator: accelerators.toggleFullscreen
          },
          {
            label: 'Toggle Sidebar',
            click: WaveboxAppPrimaryMenuActions.sidebarToggle,
            accelerator: accelerators.toggleSidebar
          },
          process.platform === 'darwin' ? undefined : {
            label: 'Toggle Menu',
            click: WaveboxAppPrimaryMenuActions.menuToggle,
            accelerator: accelerators.toggleMenu
          },
          { type: 'separator' },
          {
            label: 'Navigate Back',
            click: WaveboxAppPrimaryMenuActions.mailboxNavBack,
            accelerator: accelerators.navigateBack
          },
          {
            label: 'Navigate Forward',
            click: WaveboxAppPrimaryMenuActions.mailboxNavForward,
            accelerator: accelerators.navigateForward
          },
          { type: 'separator' },
          {
            label: 'Zoom In',
            click: WaveboxAppPrimaryMenuActions.zoomIn,
            accelerator: accelerators.zoomIn
          },
          {
            label: 'Zoom Out',
            click: WaveboxAppPrimaryMenuActions.zoomOut,
            accelerator: accelerators.zoomOut
          },
          {
            label: 'Reset Zoom',
            click: WaveboxAppPrimaryMenuActions.zoomReset,
            accelerator: accelerators.zoomReset
          },
          { type: 'separator' },
          {
            label: 'Reload',
            click: WaveboxAppPrimaryMenuActions.reload,
            accelerator: accelerators.reload
          },
          {
            label: 'Developer',
            submenu: [
              {
                label: 'Developer Tools',
                click: WaveboxAppPrimaryMenuActions.devTools,
                accelerator: accelerators.developerTools
              },
              { type: 'separator' },
              {
                label: 'Reload Wavebox Window',
                click: WaveboxAppPrimaryMenuActions.reloadWavebox,
                accelerator: accelerators.reloadWavebox
              },
              {
                label: 'Wavebox Developer Tools',
                click: WaveboxAppPrimaryMenuActions.devToolsWavebox,
                accelerator: accelerators.developerToolsWavebox
              }
            ]
          }
        ].filter((item) => item !== undefined)
      },
      {
        label: `${tlpfx}Accounts`,
        submenu: [

        ].concat(mailboxMenuConfig.mailboxes <= 1 ? [] : [
          { type: 'separator' },
          {
            label: 'Previous Account',
            click: WaveboxAppPrimaryMenuActions.prevMailbox,
            accelerator: accelerators.previousMailbox
          },
          {
            label: 'Next Account',
            click: WaveboxAppPrimaryMenuActions.nextMailbox,
            accelerator: accelerators.nextMailbox
          }
        ]).concat(mailboxMenuConfig.mailboxes <= 1 ? [] : [
          { type: 'separator' }
        ]).concat(mailboxMenuConfig.mailboxes <= 1 ? [] : mailboxMenuConfig.mailboxes.map((config, index) => {
          return {
            label: config.label,
            type: 'radio',
            checked: config.isActive,
            click: () => { WaveboxAppPrimaryMenuActions.changeMailbox(config.mailboxId) },
            accelerator: this.buildAcceleratorStringForIndex(accelerators.mailboxIndex, index)
          }
        })).concat(mailboxMenuConfig.services.length > 1 ? [
          { type: 'separator' },
          {
            label: 'Previous Service',
            click: WaveboxAppPrimaryMenuActions.prevService,
            accelerator: accelerators.servicePrevious
          },
          {
            label: 'Next Service',
            click: WaveboxAppPrimaryMenuActions.nextService,
            accelerator: accelerators.serviceNext
          }
        ] : []).concat(mailboxMenuConfig.services.length > 1 ? [
          { type: 'separator' }
        ] : []).concat(mailboxMenuConfig.services.length > 1 ? mailboxMenuConfig.services.map((config, index) => {
          return {
            label: config.label,
            type: 'radio',
            checked: config.isActive,
            click: () => { WaveboxAppPrimaryMenuActions.changeService(config.serviceId) },
            accelerator: this.buildAcceleratorStringForIndex(accelerators.serviceIndex, index)
          }
        }) : [])
      },
      {
        label: `${tlpfx}Window`,
        role: 'window',
        submenu: [
          {
            label: 'Minimize',
            role: 'minimize',
            accelerator: accelerators.minimize
          },
          {
            label: 'Cycle Windows',
            click: WaveboxAppPrimaryMenuActions.cycleWindows,
            accelerator: accelerators.cycleWindows
          },
          {
            label: 'Toggle Wavebox Mini',
            click: WaveboxAppPrimaryMenuActions.toggleWaveboxMini,
            accelerator: accelerators.toggleWaveboxMini
          }
        ].concat(mailboxMenuConfig.tabCount > 1 ? [
          { type: 'separator' },
          {
            label: 'Previous Tab',
            click: WaveboxAppPrimaryMenuActions.prevMailboxTab,
            accelerator: accelerators.prevTab
          },
          {
            label: 'Next Tab',
            click: WaveboxAppPrimaryMenuActions.nextMailboxTab,
            accelerator: accelerators.nextTab
          }
        ] : [])
      },
      {
        label: `${tlpfx}Help`,
        role: 'help',
        submenu: [
          { label: 'Wavebox Website', click: WaveboxAppPrimaryMenuActions.waveboxWebsite },
          { label: 'Wavebox Blog', click: WaveboxAppPrimaryMenuActions.waveboxBlog },
          { label: 'Wavebox on GitHub', click: WaveboxAppPrimaryMenuActions.waveboxGithub },
          { type: 'separator' },
          { label: 'Support Center', click: WaveboxAppPrimaryMenuActions.supportCenter },
          { label: 'What\'s new', click: WaveboxAppPrimaryMenuActions.whatsNew },
          { type: 'separator' },
          { label: 'Privacy', click: WaveboxAppPrimaryMenuActions.privacy },
          { label: 'EULA', click: WaveboxAppPrimaryMenuActions.eula }
        ]
      }
    ])
  }

  /**
  * Builds an accelerator string from a descriptor but with a rolling index value
  * @param accelerator: the accelerator descriptor to use
  * @param index: the index of the item to use in an array. This will be +1'ed and top & tailed
  * @return a string that can be used with electron
  */
  buildAcceleratorStringForIndex (accelerator, index) {
    if (index < 0 || index >= 9) {
      return undefined
    } else {
      return (accelerator || '').replace('Number', index + 1)
    }
  }

  /**
  * Builds and applies the mailboxes menu
  * @param accelerators: the accelerators to use
  * @param mailboxMenuConfig: the config to build the mailbox menu section
  * @param userEmail: the users email address
  */
  updateApplicationMenu (accelerators, mailboxMenuConfig, userEmail) {
    this._lastAccelerators = accelerators
    this._lastMailboxMenuConfig = mailboxMenuConfig
    this._lastUserEmail = userEmail

    const lastMenu = this._lastMenu
    this._lastMenu = this.build(accelerators, mailboxMenuConfig, userEmail)
    Menu.setApplicationMenu(this._lastMenu)
    this.updateHiddenShortcuts(accelerators)

    // Prevent Memory leak
    if (lastMenu) {
      lastMenu.destroy()
    }
  }

  /**
  * Builds a mailbox menu config from the mailbox state
  * @param mailboxState: the state of the mailbox
  * @return a js object used to build the menu
  */
  buildMailboxMenuConfig (accountState) {
    const activeMailboxId = accountState.activeMailboxId()
    const activeServiceId = accountState.activeServiceId()
    const mailboxIds = accountState.mailboxIds()
    const activeMailbox = accountState.activeMailbox()

    return {
      tabCount: accountState.serviceCount(),
      mailboxes: mailboxIds.map((mailboxId) => {
        return {
          label: accountState.resolvedMailboxDisplayName(mailboxId),
          isActive: mailboxId === activeMailboxId,
          mailboxId: mailboxId
        }
      }),
      services: activeMailbox ? activeMailbox.allServices.map((serviceId) => {
        const displayName = accountState.resolvedServiceDisplayName(serviceId)
        return {
          label: displayName,
          isActive: serviceId === activeServiceId,
          serviceId: serviceId
        }
      }) : []
    }
  }

  /* ****************************************************************************/
  // Hidden shortcuts
  /* ****************************************************************************/

  /**
  * Binds the current set of hidden shortcuts
  */
  bindHiddenShortcuts = () => {
    Array.from(this._hiddenShortcuts.keys()).forEach((shortcut) => {
      try {
        globalShortcut.register(shortcut, this._hiddenShortcuts.get(shortcut))
      } catch (ex) { }
    })
  }

  /**
  * Unbinds the current set of hidden shortcuts
  */
  unbindHiddenShortcuts = () => {
    Array.from(this._hiddenShortcuts.keys()).forEach((shortcut) => {
      try {
        globalShortcut.unregister(shortcut)
      } catch (ex) { }
    })
  }

  /**
  * Updates the hidden shortcuts
  * @param accelerators: the accelerators to use
  */
  updateHiddenShortcuts (accelerators) {
    const hiddenZoomInShortcut = process.platform === 'darwin' ? 'Cmd+=' : 'Ctrl+='
    if (accelerators.zoomIn === accelerators.zoomInDefault) {
      if (!this._hiddenShortcuts.has(hiddenZoomInShortcut)) {
        this._hiddenShortcuts.set(hiddenZoomInShortcut, () => WaveboxAppPrimaryMenuActions.zoomIn())
        if (BrowserWindow.getFocusedWindow()) {
          try {
            globalShortcut.register(hiddenZoomInShortcut, this._hiddenShortcuts.get(hiddenZoomInShortcut))
          } catch (ex) { }
        }
      }
    } else {
      if (this._hiddenShortcuts.has(hiddenZoomInShortcut)) {
        this._hiddenShortcuts.delete(hiddenZoomInShortcut)
        if (BrowserWindow.getFocusedWindow()) {
          try {
            globalShortcut.unregister(hiddenZoomInShortcut)
          } catch (ex) { }
        }
      }
    }
  }

  /* ****************************************************************************/
  // Change events
  /* ****************************************************************************/

  /**
  * Handles the mailboxes changing
  * @param accountState: the latest account state
  */
  handleMailboxesChanged = (accountState) => {
    const mailboxMenuConfig = this.buildMailboxMenuConfig(accountState)

    if (JSON.stringify(mailboxMenuConfig) !== this._lastMailboxMenuConfig) { // v lazy
      this.updateApplicationMenu(
        this._lastAccelerators,
        mailboxMenuConfig,
        this._lastUserEmail
      )
    }
  }

  /**
  * Handles the accelerators changing. If these change it will definately have a reflection in the
  * menu, so just update immediately
  * @param settingsState: the latest settings state
  */
  handleAcceleratorsChanged = (settingsState) => {
    if (settingsState.accelerators !== this._lastAccelerators) {
      this.updateApplicationMenu(
        settingsState.accelerators,
        this._lastMailboxMenuConfig,
        this._lastUserEmail
      )
    }
  }

  /**
  * Handles the user state changing
  */
  handleUserChanged = (userState) => {
    if (userState.user.userEmail !== this._lastUserEmail) {
      this.updateApplicationMenu(
        this._lastAccelerators,
        this._lastMailboxMenuConfig,
        userState.user.userEmail
      )
    }
  }

  /* ****************************************************************************/
  // Input events
  /* ****************************************************************************/

  /**
  * Converts an accelerator to an input key event, removing any quirks
  * @param accelerator: the accelertor
  * @return the input event that can be matched
  */
  _acceleratorToInputKeyEvent (accelerator) {
    const keyEvent = toKeyEvent(accelerator)

    if (!isNaN(parseInt(keyEvent.key))) {
      keyEvent.code = 'Digit' + keyEvent.key
      delete keyEvent.key
    }

    if (keyEvent.metaKey !== undefined) {
      keyEvent.meta = keyEvent.metaKey
      delete keyEvent.metaKey
    }
    if (keyEvent.ctrlKey !== undefined) {
      keyEvent.control = keyEvent.ctrlKey
      delete keyEvent.ctrlKey
    }
    if (keyEvent.shiftKey !== undefined) {
      keyEvent.shift = keyEvent.shiftKey
      delete keyEvent.shiftKey
    }

    return keyEvent
  }

  /**
  * Looks to see if an input event matches an accelerator
  * @param input: the input event
  * @param accelerator: the accelerator
  * @return true if they match
  */
  _matchInputEventToAccelerator (input, accelerator) {
    if (!accelerator) { return false }

    let expanded
    if (accelerator.toLowerCase().indexOf('number') !== -1) {
      expanded = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => {
        accelerator.replace(/number/i, n)
      })
    } else {
      expanded = [accelerator]
    }

    const match = expanded.find((accel) => {
      try {
        const targetKeyEvent = this._acceleratorToInputKeyEvent(accel)
        if (!isNaN(parseInt(targetKeyEvent.key))) {
          targetKeyEvent.code = 'Digit' + targetKeyEvent.key
          delete targetKeyEvent.key
        }
        for (var k in targetKeyEvent) {
          if (input[k] !== targetKeyEvent[k]) {
            return false
          }
        }
        return true
      } catch (ex) {
        return false
      }
    })
    return !!match
  }

  /**
  * Handles an input event being prevented
  * @param evt: the event that fired
  * @param webContentsId: the id of the webcontents that the event was prevented on
  * @param input: the input params that were prevented
  */
  handleInputEventPrevented = (evt, webContentsId, input) => {
    if (input.type !== 'keyDown') { return }
    if (!this._lastMenu) { return }

    const matchedMenu = MenuTool.allAcceleratorMenuItems(this._lastMenu)
      .find((menuItem) => this._matchInputEventToAccelerator(input, menuItem.accelerator))

    if (matchedMenu && matchedMenu.click) {
      matchedMenu.click()
    }
  }
}

export default WaveboxAppPrimaryMenu
