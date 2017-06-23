if (process.platform === 'win32') {
  try {
    module.exports = window.appNodeModulesRequire('electron-windows-notifications')
  } catch (ex) {
    module.exports = null
  }
} else {
  module.exports = null
}
