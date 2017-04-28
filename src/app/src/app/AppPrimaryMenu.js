const { Menu, shell, dialog } = require('electron')
const mailboxStore = require('./stores/mailboxStore')
const { GITHUB_URL, GITHUB_ISSUE_URL, WEB_URL, PRIVACY_URL } = require('../shared/constants')
const pkg = require('../package.json')

class AppPrimaryMenu {
  /* ****************************************************************************/
  // Selectors
  /* ****************************************************************************/

  /**
  * Builds the selector index for the primary menu manager
  * @param windowManager: the window manager instance the callbacks can call into
  * @return the selectors map
  */
  static buildSelectors (windowManager) {
    return {
      fullQuit: () => {
        windowManager.quit()
      },
      closeWindow: () => {
        const focused = windowManager.focused()
        if (focused) { focused.close() }
      },
      showWindow: () => {
        windowManager.mailboxesWindow.show().focus()
      },
      fullscreenToggle: () => {
        const focused = windowManager.focused()
        if (focused) { focused.toggleFullscreen() }
      },
      sidebarToggle: () => {
        windowManager.mailboxesWindow.toggleSidebar()
      },
      menuToggle: () => {
        windowManager.mailboxesWindow.toggleAppMenu()
      },
      preferences: () => {
        windowManager.mailboxesWindow.launchPreferences()
      },
      reload: () => {
        const focused = windowManager.focused()
        if (focused) { focused.reload() }
      },
      devTools: () => {
        const focused = windowManager.focused()
        if (focused) { focused.openDevTools() }
      },
      learnMoreGithub: () => { shell.openExternal(GITHUB_URL) },
      learnMore: () => { shell.openExternal(WEB_URL) },
      privacy: () => { shell.openExternal(PRIVACY_URL) },
      bugReport: () => { shell.openExternal(GITHUB_ISSUE_URL) },
      zoomIn: () => {
        const focused = windowManager.focused()
        if (focused) { focused.zoomIn() }
      },
      zoomOut: () => {
        const focused = windowManager.focused()
        if (focused) { focused.zoomOut() }
      },
      zoomReset: () => {
        const focused = windowManager.focused()
        if (focused) { focused.zoomReset() }
      },
      changeMailbox: (mailboxId, serviceType = undefined) => {
        windowManager.mailboxesWindow.show().focus().switchMailbox(mailboxId, serviceType)
      },
      changeMailboxServiceToIndex: (index) => {
        windowManager.mailboxesWindow.show().focus().switchToServiceAtIndex(index)
      },
      prevMailbox: () => {
        windowManager.mailboxesWindow.show().focus().switchPrevMailbox()
      },
      nextMailbox: () => {
        windowManager.mailboxesWindow.show().focus().switchNextMailbox()
      },
      cycleWindows: () => { windowManager.focusNextWindow() },
      aboutDialog: () => {
        dialog.showMessageBox({
          title: pkg.name,
          message: pkg.name,
          detail: [
            'Version: ' + pkg.version,
            'Made with ♥ at wavebox.io'
          ].join('\n'),
          buttons: [ 'Done', 'Website' ]
        }, (index) => {
          if (index === 1) {
            shell.openExternal(WEB_URL)
          }
        })
      },
      find: () => {
        const focused = windowManager.focused()
        if (focused) { focused.findStart() }
      },
      findNext: () => {
        const focused = windowManager.focused()
        if (focused) { focused.findNext() }
      },
      mailboxNavBack: () => { windowManager.mailboxesWindow.navigateMailboxBack() },
      mailboxNavForward: () => { windowManager.mailboxesWindow.navigateMailboxForward() }
    }
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (selectors) {
    this._selectors = selectors
    this._lastMailboxes = null
    this._lastActiveMailbox = null
    this._lastActiveServiceType = null

    mailboxStore.on('changed', () => {
      this.handleMailboxesChanged()
    })
  }

  /* ****************************************************************************/
  // Creating
  /* ****************************************************************************/

  /**
  * Builds the menu
  * @param mailboxes: the list of mailboxes
  * @param activeMailbox: the active mailbox
  * @param activeServiceType: the type of the active service
  * @return the new menu
  */
  build (mailboxes, activeMailbox, activeServiceType) {
    return Menu.buildFromTemplate([
      {
        label: 'Application',
        submenu: [
          { label: 'About', click: this._selectors.aboutDialog },
          { type: 'separator' },
          { label: 'Preferences', click: this._selectors.preferences, accelerator: 'CmdOrCtrl+,' },
          { type: 'separator' },
          process.platform === 'darwin' ? { label: 'Services', role: 'services', submenu: [] } : undefined,
          process.platform === 'darwin' ? { type: 'separator' } : undefined,
          { label: 'Show Window', accelerator: 'CmdOrCtrl+N', click: this._selectors.showWindow },
          { label: 'Hide Window', accelerator: 'CmdOrCtrl+W', click: this._selectors.closeWindow },
          { label: 'Hide', accelerator: 'CmdOrCtrl+H', role: 'hide' },
          { label: 'Hide Others', accelerator: process.platform === 'darwin' ? 'Command+Alt+H' : 'Ctrl+Shift+H', role: 'hideothers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: this._selectors.fullQuit }
        ].filter((item) => item !== undefined)
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
          { label: 'Paste and match style', accelerator: 'CmdOrCtrl+Shift+V', role: 'pasteandmatchstyle' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
          { type: 'separator' },
          { label: 'Find', accelerator: 'CmdOrCtrl+F', click: this._selectors.find },
          { label: 'Find Next', accelerator: 'CmdOrCtrl+G', click: this._selectors.findNext }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Toggle Full Screen', accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11', click: this._selectors.fullscreenToggle },
          { label: 'Toggle Sidebar', accelerator: (process.platform === 'darwin' ? 'Command+alt+S' : 'Ctrl+Shift+S'), click: this._selectors.sidebarToggle },
          process.platform === 'darwin' ? undefined : { label: 'Toggle Menu', accelerator: 'CmdOrCtrl+\\', click: this._selectors.menuToggle },
          { type: 'separator' },
          { label: 'Navigate Back', accelerator: 'CmdOrCtrl+[', click: this._selectors.mailboxNavBack },
          { label: 'Navigate Back', accelerator: 'CmdOrCtrl+Left', click: this._selectors.mailboxNavBack },
          { label: 'Navigate Forward', accelerator: 'CmdOrCtrl+]', click: this._selectors.mailboxNavForward },
          { type: 'separator' },
          { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: this._selectors.zoomIn },
          { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: this._selectors.zoomOut },
          { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: this._selectors.zoomReset },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: this._selectors.reload },
          { label: 'Developer Tools', accelerator: process.platform === 'darwin' ? 'Command+Alt+J' : 'Ctrl+Shift+J', click: this._selectors.devTools }
        ].filter((item) => item !== undefined)
      },
      {
        label: 'Window',
        role: 'window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Cycle Windows', accelerator: 'CmdOrCtrl+`', click: this._selectors.cycleWindows }
        ]
        .concat(mailboxes.length <= 1 ? [] : [
          { type: 'separator' },
          { label: 'Previous Mailbox', accelerator: 'CmdOrCtrl+<', click: this._selectors.prevMailbox },
          { label: 'Next Mailbox', accelerator: 'CmdOrCtrl+>', click: this._selectors.nextMailbox }
        ])
        .concat(mailboxes.length <= 1 ? [] : [{ type: 'separator' }])
        .concat(mailboxes.length <= 1 ? [] : mailboxes.map((mailbox, index) => {
          return {
            label: mailbox.displayName || 'Untitled',
            type: 'radio',
            checked: mailbox.id === (activeMailbox || {}).id,
            accelerator: index < 9 ? ('CmdOrCtrl+' + (index + 1)) : undefined,
            click: () => { this._selectors.changeMailbox(mailbox.id) }
          }
        }))
        .concat(activeMailbox && activeMailbox.hasAdditionalServices ? [{ type: 'separator' }] : [])
        .concat(activeMailbox && activeMailbox.hasAdditionalServices ? activeMailbox.enabledServices.map((service, index) => {
          const accelerator = process.platform === 'darwin' ? 'Command+Alt+' + (index + 1) : 'Ctrl+Alt+' + (index + 1)
          return {
            label: service.humanizedType,
            type: 'radio',
            checked: service.type === activeServiceType,
            accelerator: index < 9 ? accelerator : undefined,
            click: () => { this._selectors.changeMailbox(activeMailbox.id, service.type) }
          }
        }) : [])
      },
      {
        label: 'Help',
        role: 'help',
        submenu: [
          { label: 'Wavebox Website', click: this._selectors.learnMore },
          { label: 'Privacy', click: this._selectors.privacy },
          { label: 'Wavebox on GitHub', click: this._selectors.learnMoreGithub },
          { label: 'Report a Bug', click: this._selectors.bugReport }
        ]
      }
    ])
  }

  /**
  * Builds and applies the mailboxes menu
  * @param mailboxes: the current list of mailboxes
  * @param activeMailbox: the active mailbox
  * @param activeServiceType: the type of active service
  */
  updateApplicationMenu (mailboxes, activeMailbox, activeServiceType) {
    this._lastActiveMailbox = activeMailbox
    this._lastActiveServiceType = activeServiceType
    this._lastMailboxes = mailboxes
    Menu.setApplicationMenu(this.build(mailboxes, activeMailbox, activeServiceType))
  }

  /* ****************************************************************************/
  // Change events
  /* ****************************************************************************/

  /**
  * Handles the mailboxes changing
  */
  handleMailboxesChanged () {
    const activeMailbox = mailboxStore.getActiveMailbox()
    const activeServiceType = mailboxStore.getActiveServiceType()
    const mailboxes = mailboxStore.orderedMailboxes()

    // Munge our states for easier comparison
    const props = [
      [(this._lastActiveMailbox || {}).id, (activeMailbox || {}).id],
      [this._lastActiveServiceType, activeServiceType],
      [
        (this._lastMailboxes || []).map((m) => m.displayName + ';' + m.enabledServiceTypes.join(';')).join('|'),
        mailboxes.map((m) => m.displayName + ';' + m.enabledServiceTypes.join(';')).join('|')
      ]
    ]

    // Check for change
    const changed = props.findIndex(([prev, next]) => prev !== next) !== -1
    if (changed) {
      this.updateApplicationMenu(mailboxes, activeMailbox, activeServiceType)
    }
  }
}

module.exports = AppPrimaryMenu
