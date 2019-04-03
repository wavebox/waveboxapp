import { Menu, globalShortcut, app, BrowserWindow } from 'electron'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import MenuTool from 'shared/Electron/MenuTool'
import { evtMain } from 'AppEvents'
import { toKeyEvent } from 'keyboardevent-from-electron-accelerator'
import WaveboxAppPrimaryMenuActions from './WaveboxAppPrimaryMenuActions'
import QuickSwitchAcceleratorHandler from './QuickSwitchAcceleratorHandler'
let KeyboardLayout
try {
  KeyboardLayout = process.platform === 'darwin' ? require('keyboard-layout') : null
} catch (ex) {
  KeyboardLayout = null
}

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

    this._quickSwitchAcceleratorHandler = new QuickSwitchAcceleratorHandler(null, null)
    this._quickSwitchAcceleratorHandler.on('fast-switch-next', WaveboxAppPrimaryMenuActions.quickSwitchNext)
    this._quickSwitchAcceleratorHandler.on('fast-switch-prev', WaveboxAppPrimaryMenuActions.quickSwitchPrev)
    this._quickSwitchAcceleratorHandler.on('present-options-next', WaveboxAppPrimaryMenuActions.quickSwitchPresentOptionsNext)
    this._quickSwitchAcceleratorHandler.on('present-options-prev', WaveboxAppPrimaryMenuActions.quickSwitchPresentOptionsPrev)
    this._quickSwitchAcceleratorHandler.on('next-option', WaveboxAppPrimaryMenuActions.quickSwitchNextOption)
    this._quickSwitchAcceleratorHandler.on('prev-option', WaveboxAppPrimaryMenuActions.quickSwitchPrevOption)
    this._quickSwitchAcceleratorHandler.on('select-option', WaveboxAppPrimaryMenuActions.quickSwitchSelectOption)

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
            label: userEmail ? `Wavebox Subscription: ${userEmail}` : 'Wavebox Subscription: Logged out',
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
            click: () => WaveboxAppPrimaryMenuActions.fullQuit(accelerators.quit),
            accelerator: accelerators.quit
          }
        ].filter((item) => item !== undefined)
      },
      {
        label: `${tlpfx}Edit`,
        submenu: [
          {
            label: 'Undo',
            click: WaveboxAppPrimaryMenuActions.undo,
            accelerator: accelerators.undo
          },
          {
            label: 'Redo',
            click: WaveboxAppPrimaryMenuActions.redo,
            accelerator: accelerators.redo
          },
          { type: 'separator' },
          {
            label: 'Cut',
            click: WaveboxAppPrimaryMenuActions.cut,
            accelerator: accelerators.cut
          },
          {
            label: 'Copy',
            click: WaveboxAppPrimaryMenuActions.copy,
            accelerator: accelerators.copy
          },
          {
            label: 'Paste',
            click: WaveboxAppPrimaryMenuActions.paste,
            accelerator: accelerators.paste
          },
          {
            label: 'Paste and match style',
            click: WaveboxAppPrimaryMenuActions.pasteAndMatchStyle,
            accelerator: accelerators.pasteAndMatchStyle,
            // Fix for #967 paste event fires twice in contentEditable and content is pasted twice
            // Looks like the Slack team had the same problem + this fix: electron/issues/15719
            //
            // This only appears to affect win32 and linux, macOS behaves as expected. The actual
            // bug is with the binding of CmdOrCtrl+Shift+V not the functionality, so if the
            // accelerator is swapped and used elsewhere you'll see the same bug with it. Really
            // we should look out for Ctrl+Shift+V on all menu items and capture there too
            // but it's a fringe case changing doing this & hopefully chromium will fix it on
            // the next update cycle. I can't see any ill effect from setting registerAccelerator=false
            // and accelerator to be something else but wouldn't want to optimistacally do it for
            // all items
            registerAccelerator: !(process.platform === 'linux' || process.platform === 'win32')
          },
          {
            label: 'Select All',
            click: WaveboxAppPrimaryMenuActions.selectAll,
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
            label: 'Open Quick Switch',
            click: WaveboxAppPrimaryMenuActions.openCommandPalette,
            accelerator: accelerators.commandPalette
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
            label: 'Open next Task',
            click: WaveboxAppPrimaryMenuActions.openNextActiveReadingQueueLink,
            accelerator: accelerators.openNextQueueItemDefault
          },
          { type: 'separator' },
          {
            label: 'Actual Size',
            click: WaveboxAppPrimaryMenuActions.zoomReset,
            accelerator: accelerators.zoomReset
          },
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
        ].concat(mailboxMenuConfig.tabCount > 0 ? [
          { type: 'separator' },
          {
            label: 'Quick Switch Next Tab',
            click: this._quickSwitchAcceleratorHandler.nextAcceleratorFired,
            accelerator: accelerators.quickSwitchNext
          },
          {
            label: 'Quick Switch Previous Tab',
            click: this._quickSwitchAcceleratorHandler.prevAcceleratorFired,
            accelerator: accelerators.quickSwitchPrev
          }
        ] : []).concat(mailboxMenuConfig.tabCount > 1 ? [
          {
            label: 'Cycle Previous Tab',
            click: WaveboxAppPrimaryMenuActions.prevMailboxTab,
            accelerator: accelerators.prevTab
          },
          {
            label: 'Cycle Next Tab',
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
          { label: 'EULA', click: WaveboxAppPrimaryMenuActions.eula },
          { type: 'separator' },
          { label: 'Restart in Safe mode', click: WaveboxAppPrimaryMenuActions.restartSafeMode },
          { label: 'Disable Hardware Acceleration and Restart', click: WaveboxAppPrimaryMenuActions.restartWithoutHWAcceleration }
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
    this._quickSwitchAcceleratorHandler.changeAccelerator(
      accelerators.quickSwitchNext,
      accelerators.quickSwitchPrev
    )
    Menu.setApplicationMenu(this._lastMenu)
    this.updateHiddenShortcuts(accelerators)

    // Prevent Memory leak
    if (lastMenu) {
      // We wait here for two reasons...
      //
      // 1. Linuc dbus-menu to catch up. Not waiting appears to be the
      // root cause of #790. 1000ms wait is sufficient
      //
      // 2. Destroying the menu on macOS whilst its open causes the click
      // event not to fire. Open and Close callbacks don't fire on Appliaction
      // Menu, so instead wait 30000ms - enough time for the user to probably
      // action what they want to, but not long enough to cause a big memory leak
      setTimeout(() => {
        lastMenu.destroy()
      }, 30000)
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
    Array.from(this._hiddenShortcuts.values()).forEach(([accel, fn]) => {
      try {
        globalShortcut.register(accel, fn)
      } catch (ex) { }
    })
  }

  /**
  * Unbinds the current set of hidden shortcuts
  */
  unbindHiddenShortcuts = () => {
    Array.from(this._hiddenShortcuts.values()).forEach(([accel]) => {
      try {
        globalShortcut.unregister(accel)
      } catch (ex) { }
    })
  }

  /**
  * Adds a hidden shortcut
  * @param id: the id of the shortcut
  * @param accel: the accelerator string
  * @param fn: the accelerator function
  */
  _addHiddenShortcut (id, accel, fn) {
    if (this._hiddenShortcuts.has(id)) {
      const prev = this._hiddenShortcuts.get(id)
      if (prev.accel !== accel || prev.fn !== accel) {
        try { globalShortcut.unregister(prev.accel) } catch (ex) { }

        this._hiddenShortcuts.set(id, [accel, fn])
        if (BrowserWindow.getFocusedWindow()) {
          try {
            globalShortcut.register(accel, fn)
          } catch (ex) { }
        }
      }
    } else {
      this._hiddenShortcuts.set(id, [accel, fn])
      if (BrowserWindow.getFocusedWindow()) {
        try {
          globalShortcut.register(accel, fn)
        } catch (ex) { }
      }
    }
  }

  /**
  * Adds a hidden shortcut
  * @param id: the id of the shortcut
  */
  _removeHiddenShortcut (id) {
    if (this._hiddenShortcuts.has(id)) {
      const prev = this._hiddenShortcuts.get(id)
      this._hiddenShortcuts.delete(id)
      if (BrowserWindow.getFocusedWindow()) {
        try {
          globalShortcut.unregister(prev[0])
        } catch (ex) { }
      }
    }
  }

  /**
  * Updates the hidden shortcuts
  * @param accelerators: the accelerators to use
  */
  updateHiddenShortcuts (accelerators) {
    // On Chrome CmdOrCtrl+= also functions as CmdOrCtrl+Plus. Try to emulate this behaviour
    const emulatedZoomShortcut = process.platform === 'darwin' ? 'Cmd+=' : 'Ctrl+='
    let emulateZoom = true
    if (accelerators.zoomIn !== accelerators.zoomInDefault) {
      emulateZoom = false
    } else if (accelerators.hasLocalAccelerator(['Cmd+=', 'Command+=', 'Ctrl+=', 'Control+=', 'CmdOrCtrl+=', 'CommandOrControl+='])) {
      emulateZoom = false
    } else if (process.platform === 'darwin' && KeyboardLayout && KeyboardLayout.getCurrentKeyboardLayout() === 'com.apple.keylayout.Dvorak') {
      emulateZoom = false
    }

    if (emulateZoom) {
      this._addHiddenShortcut('SYSTEM_zoom', emulatedZoomShortcut, WaveboxAppPrimaryMenuActions.zoomIn)
    } else {
      this._removeHiddenShortcut('SYSTEM_zoom')
    }

    // Bind additional alt shortcuts
    if (accelerators.navigateBackAlt) {
      this._addHiddenShortcut('navigateBackAlt', accelerators.navigateBackAlt, WaveboxAppPrimaryMenuActions.mailboxNavBack)
    } else {
      this._removeHiddenShortcut('navigateBackAlt')
    }

    if (accelerators.navigateForwardAlt) {
      this._addHiddenShortcut('navigateForwardAlt', accelerators.navigateForwardAlt, WaveboxAppPrimaryMenuActions.mailboxNavForward)
    } else {
      this._removeHiddenShortcut('navigateForwardAlt')
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
  * @param accelerator: the accelerator
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
