import { shell } from 'electron'
import WaveboxWindow from './WaveboxWindow'
import { WINDOW_BACKING_TYPES } from './WindowBackingTypes'
import { CR_EXTENSION_PROTOCOL, CR_EXTENSION_BG_PARTITION_PREFIX } from 'shared/extensionApis'
import Resolver from 'Runtime/Resolver'
import { URL } from 'url'
import WindowOpeningHandler from './WindowOpeningEngine/WindowOpeningHandler'
import { GuestWebPreferences } from 'WebContentsManager'

const privExtensionId = Symbol('privExtensionId')
const privExtensionName = Symbol('privExtensionName')

class ExtensionHostedWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * Checks if this is a hosted extension url
  * @param targetUrl: the url to check
  * @return true if it's a hosted extension url
  */
  static isHostedExtensionUrl (targetUrl) {
    return new URL(targetUrl).protocol === `${CR_EXTENSION_PROTOCOL}:`
  }

  /**
  * Checks if this is a hosted extension url for an extension
  * @param targetUrl: the url to check
  * @param extensionId: the extension to check against
  * @return true if it's a hosted extension url
  */
  static isHostedExtensionUrlForExtension (targetUrl, extensionId) {
    const purl = new URL(targetUrl)
    return purl.protocol === `${CR_EXTENSION_PROTOCOL}:` && purl.hostname === extensionId
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param extensionId: the id of the extension this is for
  * @param name: the name of the extension
  */
  constructor (extensionId, extensionName) {
    super()
    this[privExtensionId] = extensionId
    this[privExtensionName] = extensionName
  }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the window
  * @param startUrl: the start url
  * @param browserWindowPreferences={}: the configuration for the window. webPreferences will be overwritten
  */
  create (startUrl, browserWindowPreferences = {}) {
    const options = {
      title: this[privExtensionName],
      minWidth: 300,
      minHeight: 300,
      backgroundColor: '#FFFFFF',
      ...browserWindowPreferences,
      webPreferences: GuestWebPreferences.sanitizeForGuestUse({
        contextIsolation: false, // Intentional as the extension shares the same namespace as chrome.* api and runs in a semi-priviledged position
        sandbox: true,
        sharedSiteInstances: true,
        preload: Resolver.crExtensionApi(),
        partition: `${CR_EXTENSION_BG_PARTITION_PREFIX}${this[privExtensionId]}`
      }),
      show: true
    }
    if (this.constructor.isHostedExtensionUrlForExtension(startUrl, this[privExtensionId])) {
      super.create(startUrl, options)
    } else {
      super.create('about:blank', options)
    }

    // Bind listeners
    this.window.webContents.on('new-window', this.handleNewWindow)
    this.window.webContents.on('will-navigate', this.handleWillNavigate)

    return this
  }

  /* ****************************************************************************/
  // Overwritable behaviour
  /* ****************************************************************************/

  /**
  * Checks if the webcontents is allowed to navigate to the next url. If false is returned
  * it will be prevented
  * @param evt: the event that fired
  * @param browserWindow: the browserWindow that's being checked
  * @param nextUrl: the next url to navigate
  * @return false to suppress, true to allow
  */
  allowNavigate (evt, browserWindow, nextUrl) {
    return true
  }

  /* ****************************************************************************/
  // Window events
  /* ****************************************************************************/

  /**
  * Handles a new window
  * @param evt: the event that fired
  * @param targetUrl: the webview url
  * @param frameName: the name of the frame
  * @param disposition: the frame disposition
  * @param options: the browser window options
  * @param additionalFeatures: The non-standard features
  */
  handleNewWindow = (evt, targetUrl, frameName, disposition, options, additionalFeatures) => {
    if (this.constructor.isHostedExtensionUrlForExtension(evt.sender.getURL(), this[privExtensionId])) {
      WindowOpeningHandler.handleOpenNewWindow(evt, {
        targetUrl: targetUrl,
        frameName: frameName,
        disposition: disposition,
        options: options,
        additionalFeatures: additionalFeatures,
        openingBrowserWindow: this.window,
        openingWindowType: this.windowType,
        tabMetaInfo: this.tabMetaInfo(evt.sender.id),
        provisionalTargetUrl: undefined // Don't pass this unless you're going to validate it's a hosted ext url!
      })
    } else {
      evt.preventDefault()
      shell.openExternal(targetUrl)
    }
  }

  /**
  * Handles the window navigating
  * @param evt: the event that fired
  * @param targetUrl: the url to open
  */
  handleWillNavigate = (evt, targetUrl) => {
    if (!this.constructor.isHostedExtensionUrlForExtension(targetUrl, this[privExtensionId])) {
      evt.preventDefault()
      shell.openExternal(targetUrl)
    }
  }

  /* ****************************************************************************/
  // Query
  /* ****************************************************************************/

  /**
  * @return the id of the focused tab
  */
  focusedTabId () {
    return this.window.webContents.id
  }

  /**
  * @return the ids of the tabs in this window
  */
  tabIds () {
    return [this.window.webContents.id]
  }
  tabMetaInfo (tabId) {
    if (tabId === this.window.webContentsId) {
      return {
        backing: WINDOW_BACKING_TYPES.EXTENSION,
        extensionId: this[privExtensionId],
        extensionName: this[privExtensionName]
      }
    } else {
      return undefined
    }
  }

  /* ****************************************************************************/
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
}

export default ExtensionHostedWindow
