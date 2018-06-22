import yargs from 'yargs'
import WaveboxCommandArgs from './WaveboxApp/WaveboxCommandArgs'
import emblinkActions from 'stores/emblink/emblinkActions'
import accountActions from 'stores/account/accountActions'
import WaveboxWindow from 'Windows/WaveboxWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'

class AppSingleInstance {
  /**
  * Processes the single instance args by passing them through to the main thread
  * @param mainWindow: the main window
  * @param emblinkActions: the emlink actions instance
  * @param mailboxActions: the mailbox actions
  * @param commandLine: the commandline arguments
  * @param workingDirectory: the current working directory
  */
  static processSingleInstanceArgs (commandLine, workingDirectory) {
    const mainWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const argv = yargs.parse(commandLine)
    WaveboxCommandArgs.processWindowVisibility(argv, mainWindow)
    WaveboxCommandArgs.processModifierArgs(argv, emblinkActions, accountActions)
  }
}

export default AppSingleInstance
