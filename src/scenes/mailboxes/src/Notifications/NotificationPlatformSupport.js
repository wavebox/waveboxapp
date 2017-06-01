const os = window.nativeRequire('os')

const enhancedSupportDarwin = process.platform === 'darwin'
const enhancedSupportLinux = process.platform === 'linux'
const enhancedSupportWin32 = (() => {
  if (process.platform === 'win32') {
    const major = parseInt(os.release().split('.')[0])
    return major >= 10
  }
  return false
})()

module.exports = {
  enhancedSupportDarwin: enhancedSupportDarwin,
  enhancedSupportLinux: enhancedSupportLinux,
  enhancedSupportWin32: enhancedSupportWin32
}
