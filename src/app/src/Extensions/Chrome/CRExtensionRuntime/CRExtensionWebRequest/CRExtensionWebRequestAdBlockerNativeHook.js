import { URL } from 'url'
import fs from 'fs-extra'
import pathTool from 'shared/pathTool'
import CRDispatchManager from '../../CRDispatchManager'
import { CRX_RUNTIME_NATIVEHOOK_MESSAGE_ } from 'shared/crExtensionIpcEvents'

const privBlockRules = Symbol('privBlockRules')
const privDisabled = Symbol('privDisabled')

class CRExtensionWebRequestAdBlockerNativeHook {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this[privDisabled] = false
    CRDispatchManager.registerHandler(`${CRX_RUNTIME_NATIVEHOOK_MESSAGE_}${extension.id}_disable`, this._handleDisableMessage)

    try {
      const blockFilename = extension.manifest.wavebox.getNativeHook('block_hosts')
      if (!blockFilename) { throw new Error('No block_hosts defined') }
      const scopedPath = pathTool.scopeToDir(extension.srcPath, blockFilename)
      if (!scopedPath) { throw new Error('block_hosts cannot be scoped to path') }
      this[privBlockRules] = new Set(fs.readJsonSync(scopedPath))
    } catch (ex) {
      console.error([
        `Extension Error: Failed to load blocking rules in AdBlocker Native Hook`,
        `    Extension ID: ${extension.id}`,
        `    Below is a log of the error:`,
        '    ---------------',
        '',
        ex,
        '',
        '    ---------------'
      ].join('\n'))
      this[privBlockRules] = new Set()
    }
  }

  /* ****************************************************************************/
  // Execution
  /* ****************************************************************************/

  /**
  * Runs the blocking request
  * @param details: the details of the request
  * @return undefined or request modifier
  */
  blockingOnBeforeRequest (details) {
    if (this[privDisabled]) { return undefined }
    if (details.resourceType === 'mainFrame') { return undefined }

    const hostname = this._safeHostname(details.url)
    if (hostname && this[privBlockRules].has(hostname)) {
      const parentHostname = this._safeHostname(details.referrer)
      if (parentHostname && this[privBlockRules].has(parentHostname)) {
        // If the parent is on a block list assume we navigated here on purpose
        // and we shouldn't also be blocking content
        return undefined
      }

      return { cancel: true }
    } else {
      return undefined
    }
  }

  /* ****************************************************************************/
  // Dispatch handlers
  /* ****************************************************************************/

  /**
  * Handles a disable/enable call
  * @param evt: the event that fired
  * @param [message]: message from the sender
  * @param responseCallback: the response call
  */
  _handleDisableMessage = (evt, [message], responseCallback) => {
    if (message.disable === true) {
      this[privDisabled] = true
    } else {
      this[privDisabled] = false
    }
    responseCallback(null, undefined)
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @param url: the url to get the hostname for
  * @return the hostname, or undefined if the url isn't valid
  */
  _safeHostname (url) {
    try {
      return new URL(url).hostname
    } catch (ex) {
      return undefined
    }
  }
}

export default CRExtensionWebRequestAdBlockerNativeHook
