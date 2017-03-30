const yargs = require('yargs')

class AppSingleInstance {
  /**
  * Processes the single instance args by passing them through to the main thread
  * @param windowManager: the window manager that's currently running
  * @param commandLine: the commandline arguments
  * @param workingDirectory: the current working directory
  */
  static processSingleInstanceArgs (windowManager, commandLine, workingDirectory) {
    const argv = yargs.parse(commandLine)
    if (windowManager) {
      if (argv.hidden || argv.hide) {
        windowManager.mailboxesWindow.hide()
      } else {
        if (argv.mailto) {
          windowManager.mailboxesWindow.openMailtoLink(argv.mailto)
        }
        const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
        if (index !== -1) {
          windowManager.mailboxesWindow.openMailtoLink(argv._[index])
          argv._.splice(1)
        }
        windowManager.mailboxesWindow.show()
        windowManager.mailboxesWindow.focus()
      }
    }
  }
}

module.exports = AppSingleInstance
