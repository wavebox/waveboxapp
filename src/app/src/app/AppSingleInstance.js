const yargs = require('yargs')
const appWindowManager = require('./appWindowManager')

class AppSingleInstance {
  /**
  * Processes the single instance args by passing them through to the main thread
  * @param commandLine: the commandline arguments
  * @param workingDirectory: the current working directory
  */
  static processSingleInstanceArgs (commandLine, workingDirectory) {
    const argv = yargs.parse(commandLine)
    if (appWindowManager && appWindowManager.mailboxesWindow) {
      if (argv.hidden || argv.hide) {
        appWindowManager.mailboxesWindow.hide()
      } else {
        if (argv.mailto) {
          appWindowManager.mailboxesWindow.openMailtoLink(argv.mailto)
        }
        const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
        if (index !== -1) {
          appWindowManager.mailboxesWindow.openMailtoLink(argv._[index])
          argv._.splice(1)
        }
        appWindowManager.mailboxesWindow.show()
        appWindowManager.mailboxesWindow.focus()
      }
    }
  }
}

module.exports = AppSingleInstance
