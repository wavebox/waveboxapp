import { webContents, session } from 'electron'
import fs from 'fs-extra'
import { format as urlFormat, URL } from 'url'
import {
  CR_EXTENSION_PROTOCOL,
  CR_EXTENSION_BG_PARTITION_PREFIX
} from 'shared/extensionApis'
import Resolver from 'Runtime/Resolver'
import { SessionManager } from 'SessionManager'
import CRExtensionMatchPatterns from 'shared/Models/CRExtension/CRExtensionMatchPatterns'

class CRExtensionBackgroundPage {
  /* ****************************************************************************/
  // Class: utils
  /* ****************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @return the partition that will be used for the background page
  */
  static partitionIdForExtension (extensionId) {
    return `${CR_EXTENSION_BG_PARTITION_PREFIX}${extensionId}`
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this._html = undefined
    this._name = undefined
    this._webContents = undefined

    this._start()
  }

  destroy () {
    this._stop()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isRunning () { return this._webContents && !this._webContents.isDestroyed() }
  get webContents () { return this._webContents }
  get webContentsId () { return this.isRunning ? this._webContents.id : undefined }
  get partitionId () { return this.constructor.partitionIdForExtension(this.extension.id) }
  get html () { return this._html }
  get name () { return this._name }

  /* ****************************************************************************/
  // WebContents pass-through
  /* ****************************************************************************/

  /**
  * Provides a function call that will send events to the webcontents
  * @param ...args: the arguments to send
  */
  sendToWebContents = (...args) => {
    if (!this._webContents) { return }
    this._webContents.send(...args)
  }

  /* ****************************************************************************/
  // Script lifecycle
  /* ****************************************************************************/

  /**
  * Starts the background scripts
  */
  _start () {
    if (!this.extension.manifest.hasBackground) { return }

    if (this.extension.manifest.background.hasHtmlPage) {
      this._name = this.extension.manifest.background.htmlPage
      try {
        this._html = fs.readFileSync(this.extension.manifest.background.getHtmlPageScoped(this.extension.srcPath))
      } catch (ex) {
        this.html = ''
      }
    } else {
      this._name = '_generated_background_page.html'
      this._html = Buffer.from(this.extension.manifest.background.generateHtmlPageForScriptset())
    }

    const partitionId = this.partitionId
    this._webContents = webContents.create({
      partition: partitionId,
      sandbox: true,
      nativeWindowOpen: true,
      sharedSiteInstances: true,
      isBackgroundPage: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      webviewTag: false,
      preload: Resolver.crExtensionApi(),
      commandLineSwitches: [
        '--background-page',
        '--nodeIntegration=false',
        '--webview-tag=false'
      ]
    })
    this._webContents.loadURL(urlFormat({
      protocol: CR_EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.extension.id,
      pathname: this._name
    }))

    // Update cors via the extension config
    SessionManager
      .webRequestEmitterFromPartitionId(partitionId)
      .beforeSendHeaders
      .onBlocking(undefined, this._handleBeforeSendHeaders)

    // Relax cors for extensions that request it
    SessionManager
      .webRequestEmitterFromPartitionId(partitionId)
      .headersReceived
      .onBlocking(undefined, this._handleAllUrlHeadersReceived)
  }

  /**
  * Stops background scripts
  * @param extension: the extension to stop
  */
  _stop (extension) {
    if (this._webContents && !this._webContents.isDestroyed()) {
      this._webContents.destroy()
    }
    this._webContents = undefined
    this._html = undefined
    this._name = undefined
  }

  /* ****************************************************************************/
  // Web Request
  /* ****************************************************************************/

  /**
  * Handles the before send headers event
  * @param details: the details of the request
  * @param responder: function to call with updated headers
  */
  _handleBeforeSendHeaders = (details, responder) => {
    if (this.isRunning && this.webContentsId === details.webContentsId) {
      if (details.resourceType === 'xhr') {
        return responder({
          requestHeaders: {
            ...details.requestHeaders,
            'Origin': ['null']
          }
        })
      }
    }

    responder({})
  }

  /**
  * Handles the headers being received and updates them if required
  * @param details: the details of the request
  * @param responder: function to call with updated headers
  */
  _handleAllUrlHeadersReceived = (details, responder) => {
    if (this.isRunning && this.webContentsId === details.webContentsId) {
      if (details.resourceType === 'xhr') {
        const {protocol, hostname, pathname} = new URL(details.url)
        if (CRExtensionMatchPatterns.matchUrls(protocol, hostname, pathname, Array.from(this.extension.manifest.permissions))) {
          const responseHeaders = details.responseHeaders
          const requestHeaders = details.headers
          const updatedHeaders = {
            ...responseHeaders,
            'access-control-allow-credentials': responseHeaders['access-control-allow-credentials'] || ['true'],
            'access-control-allow-headers': [].concat(
              responseHeaders['access-control-allow-headers'],
              requestHeaders['Access-Control-Request-Headers'],
              Object.keys(requestHeaders).filter((k) => k.startsWith('X-'))
            ),
            'access-control-allow-origin': [
              urlFormat({
                protocol: CR_EXTENSION_PROTOCOL,
                slashes: true,
                hostname: this.extension.id
              })
            ]
          }
          return responder({ responseHeaders: updatedHeaders })
        }
      }
    }
    return responder({})
  }

  /* ****************************************************************************/
  // Dev & data management
  /* ****************************************************************************/

  /**
  * Opens the developer tools
  */
  openDevTools () {
    if (!this._webContents) { return }
    this._webContents.openDevTools()
  }

  /**
  * Clears the current browser session
  * @param reloadOnComplete=true: set to false not to reload on clearing the session
  * @return promise
  */
  clearBrowserSession (reloadOnComplete = true) {
    if (!this._webContents) { return }

    const ses = session.fromPartition(this.partitionId)
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve) => { ses.clearStorageData(resolve) })
      })
      .then(() => {
        return new Promise((resolve) => { ses.clearCache(resolve) })
      })
      .then(() => {
        if (reloadOnComplete) { this.reload() }
        return Promise.resolve()
      })
  }

  /**
  * Reloads the background page
  */
  reload () {
    if (!this._webContents) { return }
    this._webContents.reload()
  }
}

export default CRExtensionBackgroundPage
