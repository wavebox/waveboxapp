const injector = require('../injector')
const {ipcRenderer} = require('electron')
const GoogleWindowOpen = require('./GoogleWindowOpen')
const path = require('path')
const fs = require('fs')
const GinboxApi = require('./GinboxApi')
const GmailApiExtras = require('./GmailApiExtras')
const GoogleService = require('./GoogleService')

class GoogleMail extends GoogleService {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.googleWindowOpen = new GoogleWindowOpen()

    this.sidebarStylesheet = document.createElement('style')
    this.sidebarStylesheet.innerHTML = `
      [href="#inbox"][data-ved]>* {
        max-height:33px !important;
        margin-top: 22px;
        background-position-x: center;
      }
      [jsaction="global.toggle_main_menu"] {
        margin-top: 5px;
      }
      [jsaction="global.toggle_main_menu"] ~ [data-action-data] {
        margin-top: 21px;
      }
    `

    // Inject some styles
    injector.injectStyle(`
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
    `)

    // Bind our listeners
    ipcRenderer.on('window-icons-in-screen', this.handleWindowIconsInScreenChange.bind(this))
    ipcRenderer.on('open-message', this.handleOpenMesage.bind(this))

    if (this.isGmail) {
      this.loadGmailAPI()
      ipcRenderer.on('compose-message', this.handleComposeMessageGmail.bind(this))
    }
    if (this.isGinbox) {
      this.loadInboxAPI()
      ipcRenderer.on('compose-message', this.handleComposeMessageGinbox.bind(this))
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isGmail () { return window.location.host.indexOf('mail.google') !== -1 }
  get isGinbox () { return window.location.host.indexOf('inbox.google') !== -1 }

  /* **************************************************************************/
  // Loaders
  /* **************************************************************************/

  /**
  * Loads the GMail API
  */
  loadGmailAPI () {
    this.gmailApi = undefined

    const jqueryPath = path.join(__dirname, '../../../../app/node_modules/jquery/dist/jquery.min.js')
    const apiPath = path.join(__dirname, '../../../../app/node_modules/gmail-js/src/gmail.js')

    injector.injectJavaScript(fs.readFileSync(jqueryPath, 'utf8'))
    injector.injectJavaScript(fs.readFileSync(apiPath, 'utf8'), () => {
      const unloadedApi = new window.Gmail()
      unloadedApi.observe.on('load', () => {
        this.gmailApi = unloadedApi
        this.googleWindowOpen.gmailApi = unloadedApi
      })
    })
  }

  /**
  * Loads the inbox API
  */
  loadInboxAPI () { }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Handles the window icons in the screen chaning
  * @param evt: the event that fired
  * @param data: the data sent with the event
  */
  handleWindowIconsInScreenChange (evt, data) {
    if (data.inscreen) {
      if (!this.sidebarStylesheet.parentElement) {
        document.head.appendChild(this.sidebarStylesheet)
      }
    } else {
      if (this.sidebarStylesheet.parentElement) {
        this.sidebarStylesheet.parentElement.removeChild(this.sidebarStylesheet)
      }
    }
  }

  /**
  * Handles a message open call
  * @param evt: the event that fired
  * @param data: the data sent with the event
  */
  handleOpenMesage (evt, data) {
    if (this.isGmail) {
      window.location.hash = 'inbox/' + data.messageId
    }
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleComposeMessageGmail (evt, data) {
    GmailApiExtras.composeMessage(this.gmailApi, data)
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleComposeMessageGinbox (evt, data) {
    GinboxApi.composeMessage(data)
  }
}

module.exports = GoogleMail
