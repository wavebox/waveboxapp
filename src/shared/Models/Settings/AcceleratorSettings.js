const Model = require('../Model')

class AcceleratorSettings extends Model {
  /* ****************************************************************************/
  // Defaults
  /* ****************************************************************************/

  // Global
  get globalToggleAppDefault () { return '' }

  // Application
  get preferencesDefault () { return 'CmdOrCtrl+,' }
  get composeMailDefault () { return 'CmdOrCtrl+N' }
  get showWindowDefault () { return 'CmdOrCtrl+Shift+N' }
  get hideWindowDefault () { return 'CmdOrCtrl+W' }
  get hideDefault () { return 'CmdOrCtrl+H' }
  get hideOthersDefault () { return process.platform === 'darwin' ? 'Command+Alt+H' : 'Ctrl+Shift+H' }
  get quitDefault () { return 'CmdOrCtrl+Q' }

  // Edit
  get undoDefault () { return 'CmdOrCtrl+Z' }
  get redoDefault () { return 'CmdOrCtrl+Shift+Z' }
  get cutDefault () { return 'CmdOrCtrl+X' }
  get copyDefault () { return 'CmdOrCtrl+C' }
  get pasteDefault () { return 'CmdOrCtrl+V' }
  get pasteAndMatchStyleDefault () { return 'CmdOrCtrl+Shift+V' }
  get selectAllDefault () { return 'CmdOrCtrl+A' }
  get findDefault () { return 'CmdOrCtrl+F' }
  get findNextDefault () { return 'CmdOrCtrl+G' }

  // View
  get toggleFullscreenDefault () { return process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11' }
  get toggleSidebarDefault () { return process.platform === 'darwin' ? 'CmdOrCtrl+Alt+S' : 'CmdOrCtrl+Shift+S' }
  get toggleMenuDefault () { return 'CmdOrCtrl+\\' }
  get navigateBackDefault () { return process.platform === 'darwin' ? 'CmdOrCtrl+Left' : 'Alt+Left' }
  get navigateForwardDefault () { return process.platform === 'darwin' ? 'CmdOrCtrl+Right' : 'Alt+Right' }
  get zoomInDefault () { return 'CmdOrCtrl+Plus' }
  get zoomOutDefault () { return 'CmdOrCtrl+-' }
  get zoomResetDefault () { return 'CmdOrCtrl+0' }
  get reloadDefault () { return 'CmdOrCtrl+R' }
  get developerToolsDefault () { return process.platform === 'darwin' ? 'Command+Alt+J' : 'Ctrl+Shift+J' }

  // Window
  get minimizeDefault () { return 'CmdOrCtrl+M' }
  get cycleWindowsDefault () { return 'CmdOrCtrl+`' }
  get previousMailboxDefault () { return 'CmdOrCtrl+<' }
  get nextMailboxDefault () { return 'CmdOrCtrl+>' }
  get mailboxIndexDefault () { return 'CmdOrCtrl+Number' }
  get serviceIndexDefault () { return 'CmdOrCtrl+Alt+Number' }

  /* ****************************************************************************/
  // Config
  /* ****************************************************************************/

  // Global
  get globalToggleApp () { return this._value_('globalToggleApp', this.globalToggleAppDefault) }

  // Application
  get preferences () { return this._value_('preferences', this.preferencesDefault) }
  get composeMail () { return this._value_('composeMail', this.composeMailDefault) }
  get showWindow () { return this._value_('showWindow', this.showWindowDefault) }
  get hideWindow () { return this._value_('hideWindow', this.hideWindowDefault) }
  get hide () { return this._value_('hide', this.hideDefault) }
  get hideOthers () { return this._value_('hideOthers', this.hideOthersDefault) }
  get quit () { return this._value_('quit', this.quitDefault) }

  // Edit
  get undo () { return this._value_('undo', this.undoDefault) }
  get redo () { return this._value_('redo', this.redoDefault) }
  get cut () { return this._value_('cut', this.cutDefault) }
  get copy () { return this._value_('copy', this.copyDefault) }
  get paste () { return this._value_('paste', this.pasteDefault) }
  get pasteAndMatchStyle () { return this._value_('pasteAndMatchStyle', this.pasteAndMatchStyleDefault) }
  get selectAll () { return this._value_('selectAll', this.selectAllDefault) }
  get find () { return this._value_('find', this.findDefault) }
  get findNext () { return this._value_('findNext', this.findNextDefault) }

  // View
  get toggleFullscreen () { return this._value_('toggleFullscreen', this.toggleFullscreenDefault) }
  get toggleSidebar () { return this._value_('toggleSidebar', this.toggleSidebarDefault) }
  get toggleMenu () { return this._value_('toggleMenu', this.toggleMenuDefault) }
  get navigateBack () { return this._value_('navigateBack', this.navigateBackDefault) }
  get navigateForward () { return this._value_('navigateForward', this.navigateForwardDefault) }
  get zoomIn () { return this._value_('zoomIn', this.zoomInDefault) }
  get zoomOut () { return this._value_('zoomOut', this.zoomOutDefault) }
  get zoomReset () { return this._value_('zoomReset', this.zoomResetDefault) }
  get reload () { return this._value_('reload', this.reloadDefault) }
  get developerTools () { return this._value_('developerTools', this.developerToolsDefault) }

  // Window
  get minimize () { return this._value_('minimize', this.minimizeDefault) }
  get cycleWindows () { return this._value_('cycleWindows', this.cycleWindowsDefault) }
  get previousMailbox () { return this._value_('previousMailbox', this.previousMailboxDefault) }
  get nextMailbox () { return this._value_('nextMailbox', this.nextMailboxDefault) }
  get mailboxIndex () { return this._value_('mailboxIndex', this.mailboxIndexDefault) }
  get serviceIndex () { return this._value_('serviceIndex', this.serviceIndexDefault) }
}

module.exports = AcceleratorSettings
