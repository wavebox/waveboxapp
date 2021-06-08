import SAPIExtensionFS from './SAPIExtensionFS'
import UrlPattern from 'url-pattern'

class SAPIRunner {
  /* ****************************************************************************/
  // Adaptors
  /* ****************************************************************************/

  /**
  * Executes all the relevant adaptors in the given contents
  * @param contents: the webcontents to run in
  * @param service: the servie to take the adaptors from
  */
  static executeAdaptors (contents, service) {
    if (!service.adaptors.length) { return }

    const currentUrl = contents.getURL()
    const adaptors = service.adaptors.filter((adaptor) => {
      const match = adaptor.matches.find((patternStr) => {
        const pattern = new UrlPattern(patternStr)
        return pattern.match(currentUrl) !== null
      })
      return match !== undefined
    })

    if (adaptors.length) {
      adaptors.forEach((adaptor) => {
        if (adaptor.hasStyles) {
          const styles = adaptor.isSAPI
            ? SAPIExtensionFS.loadContainerSAPIStringAssetSync(service.containerId, adaptor.styles)
            : adaptor.styles
          if (styles) {
            contents.insertCSS(styles)
          }
        }
        if (adaptor.hasJS) {
          const js = adaptor.isSAPI
            ? SAPIExtensionFS.loadContainerSAPIStringAssetSync(service.containerId, adaptor.JS)
            : adaptor.JS
          if (js) {
            contents.executeJavaScript(js)
          }
        }
      })
    }
  }

  /* ****************************************************************************/
  // Commands
  /* ****************************************************************************/

  /**
  * Executes a command in a contents
  * @param contents: the webcontents to run in
  * @param service: the service id
  * @param command: the command reference to use
  * @param commandString: the command string to use
  */
  static executeCommand (contents, service, command, commandString) {
    const argsString = commandString.substr(command.modifier.length + command.keyword.length).trim()

    // Build our JS
    const rawJS = !command.hasJS
      ? undefined
      : command.isSAPI
        ? SAPIExtensionFS.loadContainerSAPIStringAssetSync(service.containerId, command.JS)
        : command.JS
    const execJS = !rawJS ? undefined : `
      ;(function (modifier, keyword, args, fullCommand) {
        ${rawJS}
      })(...${JSON.stringify([command.modifier, command.keyword, argsString, commandString])})
    `

    // Build our URL
    const targetUrl = command.templateUrl(argsString)
    let urlIsSame = true
    if (targetUrl) {
      try {
        urlIsSame = new URL(targetUrl).toString() === new URL(contents.getURL()).toString()
      } catch (ex) {
        urlIsSame = false
      }
    }

    // Run the command based on current state
    if (targetUrl && !urlIsSame) {
      contents.loadURL(targetUrl)
      if (execJS) {
        contents.once('dom-ready', () => {
          contents.executeJavaScript(execJS)
        })
      }
    } else {
      if (execJS) {
        if (contents.isLoadingMainFrame()) {
          contents.once('dom-ready', () => {
            contents.executeJavaScript(execJS)
          })
        } else {
          contents.executeJavaScript(execJS)
        }
      }
    }
  }
}

export default SAPIRunner
