let windowsNotifications = null
if (process.platform === 'win32') {
  try {
    windowsNotifications = window.appNodeModulesRequire('electron-windows-notifications')
  } catch (ex) { }
}
export default windowsNotifications
