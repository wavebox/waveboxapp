import { app } from 'electron'
import { URL } from 'url'
import { AUTOFILL, AUTOFILL_HOVER } from 'shared/b64Assets'
import WaveboxWindow from 'Windows/WaveboxWindow'
import KeychainWindow from 'Windows/KeychainWindow'
import {settingsStore} from 'stores/settings'

let Keytar
try {
  Keytar = require('keytar')
} catch (ex) { }

const privConnected = Symbol('privConnected')

class AutofillService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privConnected] = new Set()

    app.on('web-contents-created', this._handleWebContentsCreated)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isLibraryLoaded () { return !!Keytar }
  get isEnabled () { return settingsStore.getState().app.enableAutofillService }
  get isAvailable () { return this.isLibraryLoaded && this.isEnabled }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles a webcontents being created by binding the event pass-throughs to it
  * @param evt: the event that fired
  * @param contents: the contents that were created
  */
  _handleWebContentsCreated = (evt, contents) => {
    setImmediate(() => {
      if (contents.isDestroyed()) { return }
      const webContentsId = contents.id
      if (this[privConnected].has(webContentsId)) { return }
      this[privConnected].add(webContentsId)

      contents.on('dom-ready', this.injectStyles)
      contents.on('destroyed', () => {
        this[privConnected].delete(webContentsId)
      })
    })
  }

  /* ****************************************************************************/
  // WebContents events
  /* ****************************************************************************/

  /**
  * Injects hints for the webcontents
  * @param evt: the event that fired
  */
  injectStyles = (evt) => {
    if (!this.isAvailable) { return }
    if (evt.sender.isDestroyed()) { return }
    if (!this.isValidAutofillUrl(evt.sender.getURL())) { return }
    evt.sender.insertCSS(`
      input[type="password"] {
        background-size: auto 24px;
        background-repeat: no-repeat;
        background-position: right center;
        background-image: url("${AUTOFILL}");
      }
      input[type="password"]:hover {
        background-size: auto 24px;
        background-repeat: no-repeat;
        background-position: right center;
        background-image: url("${AUTOFILL_HOVER}");
      }
    `)
  }

  /* ****************************************************************************/
  // Getters & Setters
  /* ****************************************************************************/

  /**
  * Checks if this is a valid autofill url
  * @param targetUrl: the url to check
  * @return true if this is a valid url
  */
  isValidAutofillUrl (targetUrl) {
    try {
      return new URL(targetUrl).protocol === 'https:'
    } catch (ex) {
      return false
    }
  }

  /**
  * Generates a service name from a given url
  * @param targetUrl: the url
  * @return the service name
  */
  serviceNameFromUrl (targetUrl) {
    const purl = new URL(targetUrl)
    return `${purl.protocol}//${purl.hostname}`
  }

  /**
  * Finds the credentials for a service
  * @param targetUrl: the url to find for
  * @return promise
  */
  findCredentials (targetUrl) {
    if (!this.isAvailable) { return Promise.reject(new Error('Autofill service not available')) }
    if (!this.isValidAutofillUrl(targetUrl)) { return Promise.reject(new Error('Autofill url invalid')) }

    return Keytar.findCredentials(this.serviceNameFromUrl(targetUrl)).then((res) => res || [])
  }

  /**
  * Adds credentials
  * @param targetUrl: the url to add for
  * @param account: the account name
  * @param password: the password
  * @return promise
  */
  addCredentials (targetUrl, account, password) {
    if (!this.isAvailable) { return Promise.reject(new Error('Autofill service not available')) }
    if (!this.isValidAutofillUrl(targetUrl)) { return Promise.reject(new Error('Autofill url invalid')) }

    return Keytar.setPassword(this.serviceNameFromUrl(targetUrl), account, password)
  }

  /**
  * Deletes credentials
  * @param targetUrl: the url to add for
  * @param account: the account name
  * @return promise
  */
  deleteCredentials (targetUrl, account) {
    if (!this.isAvailable) { return Promise.reject(new Error('Autofill service not available')) }
    if (!this.isValidAutofillUrl(targetUrl)) { return Promise.reject(new Error('Autofill url invalid')) }

    return Keytar.deletePassword(this.serviceNameFromUrl(targetUrl), account)
  }

  /* ****************************************************************************/
  // Autofill manager
  /* ****************************************************************************/

  /**
  * Opens the autofill manager window
  * @param targetUrl: the url to open the manager for
  * @param openMode=undefined: an open mode to pass to the manager
  */
  openAutofillManager (targetUrl, openMode = undefined) {
    if (!this.isAvailable) { throw new Error('Autofill service not available') }
    if (!this.isValidAutofillUrl(targetUrl)) { throw new Error('Autofill url invalid') }

    const serviceName = this.serviceNameFromUrl(targetUrl)
    const existingWindow = WaveboxWindow.getOfType(KeychainWindow)
    if (existingWindow) {
      existingWindow.focus()
      existingWindow.changeServiceName(serviceName, openMode)
    } else {
      const newWindow = new KeychainWindow(serviceName, openMode)
      newWindow.create()
    }
  }

  /**
  * Opens the autofill manager window
  * @param targetUrl: the url to open the manager for
  */
  addAutofillPassword (targetUrl) {
    this.openAutofillManager(targetUrl, 'add')
  }
}

export default AutofillService
