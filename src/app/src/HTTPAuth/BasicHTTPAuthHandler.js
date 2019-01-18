import { BrowserWindow } from 'electron'
import querystring from 'querystring'
import { settingsStore } from 'stores/settings'
import ElectronWebContentsWillNavigateShim from 'ElectronTools/ElectronWebContentsWillNavigateShim'
import pkg from 'package.json'

let Keytar
try {
  Keytar = require('keytar')
} catch (ex) { }

const privWindow = Symbol('privWindow')
const privCallback = Symbol('privCallback')
const privAuthInfo = Symbol('privAuthInfo')
const privDidAutofill = Symbol('privDidAutofill')

class BasicHTTPAuthHandler {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWindow] = null
    this[privCallback] = null
    this[privAuthInfo] = null
    this[privDidAutofill] = false
  }

  /**
  * Starts the authentication process
  * @param parent: the parent window
  * @param request: the request object
  * @param authInfo: the auth info object
  * @param callback: callback to execute with username and password
  */
  start (parent, request, authInfo, callback) {
    if (this[privWindow]) { return }

    this[privCallback] = callback
    this[privAuthInfo] = authInfo
    this[privDidAutofill] = false
    this[privWindow] = new BrowserWindow({
      parent: parent,
      modal: true,
      width: 450,
      height: 320,
      useContentSize: true,
      frame: false,
      center: true,
      resizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      show: true,
      backgroundColor: '#FFFFFF',
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        webviewTag: false
      }
    })

    // Bind event listeners
    this[privWindow].on('page-title-updated', this.handlePageTitleUpdated)
    this[privWindow].webContents.on('dom-ready', this.handleDOMReady)
    this[privWindow].on('destroyed', this.handleWindowDestroyed)

    // Load url
    const qs = querystring.stringify({
      port: authInfo.port,
      realm: authInfo.realm,
      host: authInfo.host,
      autofillAvailable: this.autofillAvailable
    })
    this[privWindow].loadURL(`file://${__dirname}/BasicHTTPAuthHandler.html?${qs}`)
    ElectronWebContentsWillNavigateShim.on(
      this[privWindow].webContents,
      (evt) => evt.preventDefault()
    )
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get autofillAvailable () { return !!Keytar && settingsStore.getState().app.enableAutofillService }
  get credentialsKey () { return `${pkg.name}:HTTPBasicAuth` }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles the page title updating
  * @param evt: the event that fired
  * @param title: the title that was set
  */
  handlePageTitleUpdated = (evt, title) => {
    if (title.startsWith('wbaction:')) {
      evt.preventDefault()

      if (title === 'wbaction:cancel') {
        this[privCallback](undefined, undefined)
        this[privWindow].close()
      } else if (title === 'wbaction:login') {
        this[privWindow].webContents.executeJavaScript(`[
          document.querySelector('[name="username"]').value,
          document.querySelector('[name="password"]').value,
          document.querySelector('[name="save"]').checked
        ]`, (res) => {
          this.handleSubmitCredentials(res[0], res[1], res[2])
        })
      }
    }
  }

  /**
  * Handles the submission of the credentials
  * @param username: the username entered
  * @param password: the password entered
  * @param save: true to save, false to delete
  */
  handleSubmitCredentials = (username, password, save) => {
    Promise.resolve()
      .then(() => {
        if (!this.autofillAvailable) {
          return Promise.resolve()
        }

        if (save) {
          return Keytar.setPassword(this.credentialsKey, this[privAuthInfo].host, JSON.stringify({
            username: username,
            password: password
          }))
        } else {
          if (this[privDidAutofill]) {
            return Keytar.deletePassword(this.credentialsKey, this[privAuthInfo].host)
          } else {
            return Promise.resolve()
          }
        }
      })
      .catch((ex) => {
        return Promise.resolve()
      })
      .then(() => {
        this[privCallback](username, password)
        this[privWindow].close()
      })
  }

  /**
  * Handles the dom becoming ready
  * @param evt: the event that fired
  */
  handleDOMReady = (evt) => {
    if (this.autofillAvailable) {
      Keytar.findCredentials(this.credentialsKey).then((res) => {
        const match = (res || []).find((service) => service.account === this[privAuthInfo].host)
        if (!match) { return }
        let credential
        try {
          credential = JSON.parse(match.password)
        } catch (ex) { return }

        this[privDidAutofill] = true
        this[privWindow].webContents.executeJavaScript(`
          document.querySelector('[name="username"]').value = "${credential.username.replace(/"/g, '\\"')}";
          document.querySelector('[name="password"]').value = "${credential.password.replace(/"/g, '\\"')}";
          document.querySelector('[name="save"]').checked = true;
        `)
      })
    }
  }

  /**
  * Handles the window coming down
  */
  handleWindowDestroyed = () => {
    this[privCallback] = null
    this[privWindow] = null
    this[privAuthInfo] = null
    this[privDidAutofill] = false
  }
}

export default BasicHTTPAuthHandler
