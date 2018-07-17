const Model = require('../Model')

class AcceleratorSettings extends Model {
  /* ****************************************************************************/
  // Defaults
  /* ****************************************************************************/

  // Global
  get globalToggleAppDefault () { return '' }
  get globalToggleWaveboxMiniDefault () { return '' }
  get globalShowAppMailbox0Default () { return '' }
  get globalShowAppMailbox1Default () { return '' }
  get globalShowAppMailbox2Default () { return '' }
  get globalShowAppMailbox3Default () { return '' }
  get globalShowAppMailbox4Default () { return '' }
  get globalShowAppMailbox5Default () { return '' }
  get globalShowAppMailbox6Default () { return '' }
  get globalShowAppMailbox7Default () { return '' }
  get globalShowAppMailbox8Default () { return '' }
  get globalShowAppMailbox9Default () { return '' }

  // Application
  get preferencesDefault () { return 'CmdOrCtrl+,' }
  get composeMailDefault () { return 'CmdOrCtrl+N' }
  get composeMailHereDefault () { return 'CmdOrCtrl+Shift+N' }
  get closeWindowDefault () { return 'CmdOrCtrl+W' }
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
  get copyCurrentTabUrlDefault () { return undefined }
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
  get reloadWaveboxDefault () { return 'CmdOrCtrl+Shift+R' }
  get developerToolsDefault () { return process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I' }
  get developerToolsWaveboxDefault () { return process.platform === 'darwin' ? 'Command+Alt+J' : 'Ctrl+Shift+J' }

  // Window
  get minimizeDefault () { return 'CmdOrCtrl+M' }
  get cycleWindowsDefault () { return 'CmdOrCtrl+`' }
  get previousMailboxDefault () { return 'CmdOrCtrl+<' }
  get nextMailboxDefault () { return 'CmdOrCtrl+>' }
  get mailboxIndexDefault () { return 'CmdOrCtrl+Number' }
  get servicePreviousDefault () { return 'CmdOrCtrl+Alt+<' }
  get serviceNextDefault () { return 'CmdOrCtrl+Alt+>' }
  get serviceIndexDefault () { return process.platform === 'darwin' ? 'Command+Alt+Number' : undefined }
  get nextTabDefault () { return process.platform === 'darwin' ? 'Command+Alt+Right' : 'Ctrl+Tab' }
  get prevTabDefault () { return process.platform === 'darwin' ? 'Command+Alt+Left' : 'Ctrl+Shift+Tab' }
  get toggleWaveboxMiniDefault () { return process.platform === 'darwin' ? 'Cmd+Alt+M' : 'Ctrl+Shift+M' }

  /* ****************************************************************************/
  // Config
  /* ****************************************************************************/

  // Global
  get globalToggleApp () { return this._value_('globalToggleApp', this.globalToggleAppDefault) }
  get globalToggleWaveboxMini () { return this._value_('globalToggleWaveboxMini', this.globalToggleWaveboxMiniDefault) }
  get globalShowAppMailbox0 () { return this._value_('globalShowAppMailbox0', this.globalShowAppMailbox0Default) }
  get globalShowAppMailbox1 () { return this._value_('globalShowAppMailbox1', this.globalShowAppMailbox1Default) }
  get globalShowAppMailbox2 () { return this._value_('globalShowAppMailbox2', this.globalShowAppMailbox2Default) }
  get globalShowAppMailbox3 () { return this._value_('globalShowAppMailbox3', this.globalShowAppMailbox3Default) }
  get globalShowAppMailbox4 () { return this._value_('globalShowAppMailbox4', this.globalShowAppMailbox4Default) }
  get globalShowAppMailbox5 () { return this._value_('globalShowAppMailbox5', this.globalShowAppMailbox5Default) }
  get globalShowAppMailbox6 () { return this._value_('globalShowAppMailbox6', this.globalShowAppMailbox6Default) }
  get globalShowAppMailbox7 () { return this._value_('globalShowAppMailbox7', this.globalShowAppMailbox7Default) }
  get globalShowAppMailbox8 () { return this._value_('globalShowAppMailbox8', this.globalShowAppMailbox8Default) }
  get globalShowAppMailbox9 () { return this._value_('globalShowAppMailbox9', this.globalShowAppMailbox9Default) }

  // Application
  get preferences () { return this._value_('preferences', this.preferencesDefault) }
  get composeMail () { return this._value_('composeMail', this.composeMailDefault) }
  get composeMailHere () { return this._value_('composeMailHere', this.composeMailHereDefault) }
  get closeWindow () { return this._value_('closeWindow', this.closeWindowDefault) }
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
  get copyCurrentTabUrl () { return this._value_('copyCurrentTabUrl', this.copyCurrentTabUrlDefault) }
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
  get reloadWavebox () { return this._value_('reloadWavebox', this.reloadWaveboxDefault) }
  get developerTools () { return this._value_('developerTools', this.developerToolsDefault) }
  get developerToolsWavebox () { return this._value_('developerToolsWavebox', this.developerToolsWaveboxDefault) }

  // Window
  get minimize () { return this._value_('minimize', this.minimizeDefault) }
  get cycleWindows () { return this._value_('cycleWindows', this.cycleWindowsDefault) }
  get previousMailbox () { return this._value_('previousMailbox', this.previousMailboxDefault) }
  get nextMailbox () { return this._value_('nextMailbox', this.nextMailboxDefault) }
  get mailboxIndex () { return this._value_('mailboxIndex', this.mailboxIndexDefault) }
  get servicePrevious () { return this._value_('servicePrevious', this.servicePreviousDefault) }
  get serviceNext () { return this._value_('serviceNext', this.serviceNextDefault) }
  get serviceIndex () { return this._value_('serviceIndex', this.serviceIndexDefault) }
  get nextTab () { return this._value_('nextTab', this.nextTabDefault) }
  get prevTab () { return this._value_('prevTab', this.prevTabDefault) }
  get toggleWaveboxMini () { return this._value_('toggleWaveboxMini', this.toggleWaveboxMiniDefault) }
}

module.exports = AcceleratorSettings
