const Model = require('../Model')

class AcceleratorSettings extends Model {
  // Application
  get preferences () { return this._value_('preferences', ['CmdOrCtrl', undefined, ',']) }
  get showWindow () { return this._value_('showWindow', ['CmdOrCtrl', undefined, 'N']) }
  get hideWindow () { return this._value_('hideWindow', ['CmdOrCtrl', undefined, 'W']) }
  get hide () { return this._value_('hide', ['CmdOrCtrl', undefined, 'H']) }
  get hideOthers () { return this._value_('hideOthers', process.platform === 'darwin' ? ['Command', 'Alt', 'H'] : ['Ctrl', 'Shift', 'H']) }
  get quit () { return this._value_('quit', ['CmdOrCtrl', undefined, 'Q']) }

  // Edit
  get undo () { return this._value_('undo', ['CmdOrCtrl', undefined, 'Z']) }
  get redo () { return this._value_('redo', ['CmdOrCtrl', 'Shift', 'Z']) }
  get cut () { return this._value_('cut', ['CmdOrCtrl', undefined, 'X']) }
  get copy () { return this._value_('copy', ['CmdOrCtrl', undefined, 'C']) }
  get paste () { return this._value_('paste', ['CmdOrCtrl', undefined, 'V']) }
  get pasteAndMatchStyle () { return this._value_('pasteAndMatchStyle', ['CmdOrCtrl', 'Shift', 'V']) }
  get selectAll () { return this._value_('selectAll', ['CmdOrCtrl', undefined, 'A']) }
  get find () { return this._value_('find', ['CmdOrCtrl', undefined, 'F']) }
  get findNext () { return this._value_('findNext', ['CmdOrCtrl', undefined, 'G']) }

  // View
  get toggleFullScreen () { return this._value_('toggleFullScreen', process.platform === 'darwin' ? ['Ctrl', 'Command', 'F'] : ['F11', undefined, undefined]) }
  get toggleSidebar () { return this._value_('toggleSidebar', process.platform === 'darwin' ? ['CmdOrCtrl', 'Alt', 'S'] : ['CmdOrCtrl', 'Shift', 'S']) }
  get toggleMenu () { return this._value_('toggleMenu', ['CmdOrCtrl', undefined, '\\']) }
  get navigateBack () { return this._value_('navigateBack', ['CmdOrCtrl', undefined, 'Left']) }
  get navigateForward () { return this._value_('navigateForward', ['CmdOrCtrl', undefined, 'Right']) }
  get zoomIn () { return this._value_('zoomIn', ['CmdOrCtrl', undefined, 'Plus']) }
  get zoomOut () { return this._value_('zoomOut', ['CmdOrCtrl', undefined, '-']) }
  get zoomReset () { return this._value_('zoomReset', ['CmdOrCtrl', undefined, '0']) }
  get reload () { return this._value_('reload', ['CmdOrCtrl', undefined, 'R']) }
  get developerTools () { return this._value_('developerTools', process.platform === 'darwin' ? ['Command', 'Alt', 'J'] : ['Ctrl', 'Shift', 'J']) }

  // Window
  get minimize () { return this._value_('minimize', ['CmdOrCtrl', undefined, 'M']) }
  get cycleWindows () { return this._value_('cycleWindows', ['CmdOrCtrl', undefined, '`']) }
  get previousMailbox () { return this._value_('previousMailbox', ['CmdOrCtrl', undefined, '<']) }
  get nextMailbox () { return this._value_('nextMailbox', ['CmdOrCtrl', undefined, '>']) }
  get mailboxIndex () { return this._value_('mailboxIndex', ['CmdOrCtrl', undefined, 'Number']) }
  get serviceIndex () { return this._value_('serviceIndex', ['CmdOrCtrl', 'Alt', 'Number']) }
}

module.exports = AcceleratorSettings
