import { webContents } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import url from 'url'
import {
  CR_EXTENSION_PROTOCOL,
  CR_EXTENSION_BG_PARTITION_PREFIX
} from 'shared/extensionApis'
import Resolver from 'Runtime/Resolver'
import { SessionManager } from 'SessionManager'

class CRExtensionBackgroundPage {
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
  get webContentsId () { return this._webContents.id }
  get html () { return this._html }
  get name () { return this._name }

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
      this._html = fs.readFileSync(path.join(this.extension.srcPath, this.extension.manifest.background.htmlPage))
    } else {
      this._name = '_generated_background_page.html'
      this._html = Buffer.from(this.extension.manifest.background.generateHtmlPageForScriptset())
    }

    const partitionId = `${CR_EXTENSION_BG_PARTITION_PREFIX}${this.extension.id}`
    this._webContents = webContents.create({
      partition: partitionId,
      isBackgroundPage: true,
      preload: Resolver.crExtensionApi(),
      commandLineSwitches: [
        '--background-page',
        '--nodeIntegration=false'
      ]
    })
    this._webContents.loadURL(url.format({
      protocol: CR_EXTENSION_PROTOCOL,
      slashes: true,
      hostname: this.extension.id,
      pathname: this._name
    }))

    // Relax cors for extensions that request it
    if (this.extension.manifest.permissions.has('<all_urls>')) {
      SessionManager
        .webRequestEmitterFromPartitionId(partitionId)
        .headersReceived
        .onBlocking(undefined, this._handleAllUrlHeadersReceived)
    }
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
  * Handles the headers being received and updates them if required
  * @param details: the details of the request
  * @param responder: function to call with updated headers
  */
  _handleAllUrlHeadersReceived = (details, responder) => {
    if (details.resourceType === 'xhr') {
      const headers = details.responseHeaders
      const updatedHeaders = {
        ...headers,
        'access-control-allow-credentials': headers['access-control-allow-credentials'] || ['true'],
        'access-control-allow-origin': (headers['access-control-allow-origin'] || []).concat([
          url.format({
            protocol: CR_EXTENSION_PROTOCOL,
            slashes: true,
            hostname: this.extension.id
          })
        ])
      }
      responder({ responseHeaders: updatedHeaders })
    } else {
      responder({})
    }
  }

  /* ****************************************************************************/
  // Dev
  /* ****************************************************************************/

  /**
  * Opens the developer tools
  */
  openDevTools () {
    if (!this._webContents) { return }
    this._webContents.openDevTools()
  }
}

export default CRExtensionBackgroundPage
