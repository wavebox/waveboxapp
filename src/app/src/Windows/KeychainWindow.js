import WaveboxWindow from './WaveboxWindow'
import Resolver from 'Runtime/Resolver'
import { ipcMain } from 'electron'
import uuid from 'uuid'
import querystring from 'querystring'
import Services from 'Services'
import {
  WB_KEYCHAIN_REQUEST_CREDENTIALS,
  WB_KEYCHAIN_SUPPLY_CREDENTIALS,
  WB_KEYCHAIN_ADD_CREDENTIALS,
  WB_KEYCHAIN_DELETE_CREDENTIALS
} from 'shared/ipcEvents'

const privServiceName = Symbol('privServiceName')
const privKey = Symbol('privKey')
const privOpenMode = Symbol('privOpenMode')

class KeychainWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Class: Properties
  /* ****************************************************************************/

  static get windowType () { return this.WINDOW_TYPES.KEYCHAIN }

  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  /**
  * @param serviceName: the name of the service to edit for
  * @param openMode=undefined: the open mode to use
  * @param saverTag=undefined: window pos saver location
  */
  constructor (serviceName, openMode = undefined, saverTag = undefined) {
    super(saverTag)
    this[privServiceName] = serviceName
    this[privOpenMode] = openMode
    this[privKey] = uuid.v4()
  }

  /**
  * Generates the page url from the current state
  * @return a url to be loaded
  */
  generateUrl () {
    const qs = querystring.stringify({
      service: this[privServiceName],
      openMode: this[privOpenMode],
      key: this[privKey]
    })
    return `file://${Resolver.keychainScene('keychain.html')}?${qs}`
  }

  create (url, browserWindowPreferences = {}) {
    super.create(this.generateUrl(), {
      title: 'Wavebox Keychain',
      width: 900,
      height: 700,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        webviewTag: false
      }
    })

    ipcMain.on(WB_KEYCHAIN_REQUEST_CREDENTIALS, this.handleCredentialsRequest)
    ipcMain.on(WB_KEYCHAIN_ADD_CREDENTIALS, this.handleAddCredentials)
    ipcMain.on(WB_KEYCHAIN_DELETE_CREDENTIALS, this.handleDeleteCredentials)
  }

  destroy () {
    ipcMain.removeListener(WB_KEYCHAIN_REQUEST_CREDENTIALS, this.handleCredentialsRequest)
    ipcMain.removeListener(WB_KEYCHAIN_ADD_CREDENTIALS, this.handleAddCredentials)
    ipcMain.removeListener(WB_KEYCHAIN_DELETE_CREDENTIALS, this.handleDeleteCredentials)
    super.destroy()
  }

  /* ****************************************************************************/
  // Service Name
  /* ****************************************************************************/

  /**
  * Changes the service name
  * @param serviceName: the name of the service
  * @param openMode=undefined: the opeb mode to use
  */
  changeServiceName (serviceName, openMode = undefined) {
    this[privServiceName] = serviceName
    this[privOpenMode] = openMode
    this[privKey] = uuid.v4()
    this.window.webContents.loadURL(this.generateUrl())
  }

  /**
  * @param cred: the credentials to strip
  * @return the credentials for the webcontents
  */
  credentialsForWebContents (cred) {
    return cred.map((rec) => {
      return { account: rec.account }
    })
  }

  /* ****************************************************************************/
  // IPC Requests
  /* ****************************************************************************/

  /**
  * @param evt: the event that fired
  * @param key: the api key
  * @param serviceName: the service name
  */
  handleCredentialsRequest = (evt, key, serviceName) => {
    if (evt.sender !== this.window.webContents || key !== this[privKey]) { return }
    Services.autofillService.findCredentials(this[privServiceName])
      .then((cred) => {
        evt.sender.send(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this[privServiceName], this.credentialsForWebContents(cred))
      })
      .catch(() => {
        evt.sender.send(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this[privServiceName], [])
      })
  }

  /**
  * @param evt: the event that fired
  * @param key: the api key
  * @param serviceName: the service name
  * @param account: the account name
  * @param password: the account password
  */
  handleAddCredentials = (evt, key, serviceName, account, password) => {
    if (evt.sender !== this.window.webContents || key !== this[privKey]) { return }

    Promise.resolve()
      .then(() => Services.autofillService.addCredentials(this[privServiceName], account, password))
      .catch((e) => Promise.resolve())
      .then(() => Services.autofillService.findCredentials(this[privServiceName]))
      .then((cred) => {
        evt.sender.send(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this[privServiceName], this.credentialsForWebContents(cred))
      })
      .catch(() => {
        evt.sender.send(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this[privServiceName], [])
      })
  }

  /**
  * @param evt: the event that fired
  * @param key: the api key
  * @param serviceName: the service name
  * @param accounts: an array of accounts
  */
  handleDeleteCredentials = (evt, key, serviceName, accounts) => {
    if (evt.sender !== this.window.webContents || key !== this[privKey]) { return }

    Promise.resolve()
      .then(() => {
        return accounts.reduce((acc, account) => {
          return acc.then(() => Services.autofillService.deleteCredentials(this[privServiceName], account))
        }, Promise.resolve())
      })
      .catch(() => Promise.resolve())
      .then(() => Services.autofillService.findCredentials(this[privServiceName]))
      .then((cred) => {
        evt.sender.send(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this[privServiceName], this.credentialsForWebContents(cred))
      })
      .catch(() => {
        evt.sender.send(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this[privServiceName], [])
      })
  }

  /* ****************************************************************************/
  // Info
  /* ****************************************************************************/

  focusedTabId () { return null }
  tabIds () { return [] }
  tabMetaInfo (tabId) { return undefined }

  /**
  * @return process info about the tabs with { webContentsId, description, pid }
  */
  webContentsProcessInfo () {
    return [{
      webContentsId: this.window.webContents.id,
      pid: this.window.webContents.getOSProcessId(),
      description: `Wavebox Keychain Window (${this[privServiceName]})`
    }]
  }
}

export default KeychainWindow
