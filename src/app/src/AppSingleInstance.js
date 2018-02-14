import yargs from 'yargs'

class AppSingleInstance {
  /**
  * Processes the single instance args by passing them through to the main thread
  * @param mainWindow: the main window
  * @param emblinkActions: the emlink actions instance
  * @param commandLine: the commandline arguments
  * @param workingDirectory: the current working directory
  */
  static processSingleInstanceArgs (mainWindow, emblinkActions, commandLine, workingDirectory) {
    const argv = yargs.parse(commandLine)

    if (mainWindow) {
      if (argv.hidden || argv.hide) {
        mainWindow.hide()
      } else {
        if (argv.mailto) {
          emblinkActions.composeNewMailtoLink(argv.mailto)
        }
        const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
        if (index !== -1) {
          emblinkActions.composeNewMailtoLink(argv._[index])
          argv._.splice(1)
        }
        mainWindow.show()
        mainWindow.focus()
      }
    }
  }
}

export default AppSingleInstance
