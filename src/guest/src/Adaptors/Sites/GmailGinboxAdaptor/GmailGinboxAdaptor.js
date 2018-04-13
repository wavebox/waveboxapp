import BaseAdaptor from '../BaseAdaptor'
import {ipcRenderer, webFrame} from 'electron'
import GinboxApi from './GinboxApi'
import GmailApi from './GmailApi'
import GmailChangeEmitter from './GmailChangeEmitter'
import GinboxChangeEmitter from './GinboxChangeEmitter'
import {
  WB_BROWSER_WINDOW_ICONS_IN_SCREEN,
  WB_BROWSER_OPEN_MESSAGE,
  WB_BROWSER_COMPOSE_MESSAGE
} from 'shared/ipcEvents'
import { UISettings } from 'shared/Models/Settings'
import settingStore from 'stores/settingStore'
import LiveConfig from 'LiveConfig'
import { ExtensionLoader } from 'Browser'

class GmailGinboxAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://mail.google.com(*)',
      'http(s)\\://inbox.google.com(*)'
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    this.changeEmitter = null

    this.sidebarStylesheet = document.createElement('style')
    this.sidebarStylesheet.innerHTML = `
      body:not([jscontroller]) [role="banner"] [href="#inbox"][title] {
        max-height:33px !important;
        margin-top: 22px;
        background-position-x: center;
      }
      body:not([jscontroller]) [href="#inbox"][data-ved]>* {
        max-height:33px !important;
        margin-top: 22px;
        background-position-x: center;
      }
    `

    // Bind our listeners
    ipcRenderer.on(WB_BROWSER_WINDOW_ICONS_IN_SCREEN, this.handleWindowIconsInScreenChange)
    ipcRenderer.on(WB_BROWSER_OPEN_MESSAGE, this.handleOpenMesage)
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.GOOGLE_MAIL_WINDOW_OPEN)

    if (this.isGmail) {
      this.loadGmailAPI()
      ipcRenderer.on(WB_BROWSER_COMPOSE_MESSAGE, this.handleComposeMessageGmail)

      if (LiveConfig.platform === 'darwin' && settingStore.ui.vibrancyMode !== UISettings.VIBRANCY_MODES.NONE) {
        webFrame.insertCSS(`
          body, .wl, .aeJ {
            background-color: transparent !important;
          }
        `)
      }
    }
    if (this.isGinbox) {
      this.loadInboxAPI()
      ipcRenderer.on(WB_BROWSER_COMPOSE_MESSAGE, this.handleComposeMessageGinbox)

      if (LiveConfig.platform === 'darwin' && settingStore.ui.vibrancyMode !== UISettings.VIBRANCY_MODES.NONE) {
        webFrame.insertCSS(`
          body, nav[jsaction]:not([role="banner"]), nav[jsaction]:not([role="banner"])>[role="menu"], .I {
            background-color: transparent !important;
          }
          .az {
            background-color: rgba(221, 221, 221, 0.8) !important;
            border-radius: 3px !important;
          }
        `)
      }
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
    this.changeEmitter = new GmailChangeEmitter()
  }

  /**
  * Loads the inbox API
  */
  loadInboxAPI () {
    this.changeEmitter = new GinboxChangeEmitter()
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Handles the window icons in the screen chaning
  * @param evt: the event that fired
  * @param data: the data sent with the event
  */
  handleWindowIconsInScreenChange = (evt, data) => {
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
  handleOpenMesage = (evt, data) => {
    if (this.isGmail) {
      window.location.hash = 'inbox/' + data.messageId
    } else if (this.isGinbox) {
      if (data.search && data.search.length) {
        GinboxApi.clearSearchItems(() => {
          GinboxApi.startSearch(data.search, () => {
            GinboxApi.openFirstSearchItem()
          })
        })
      }
    }
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleComposeMessageGmail = (evt, data) => {
    if (!GmailApi.composeMessage(data)) {
      let retries = 0
      const retry = setInterval(() => {
        if (retries >= 10 || GmailApi.composeMessage(data)) {
          clearInterval(retry)
        } else {
          retries++
        }
      }, 250)
    }
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleComposeMessageGinbox = (evt, data) => {
    const retrier = function (tries, max) {
      if (tries >= max) { return }
      GinboxApi.composeMessage(data)
        .catch(() => Promise.resolve())
        .then((success) => {
          if (!success) {
            setTimeout(() => {
              retrier(tries + 1, max)
            }, 250)
          }
        })
    }

    retrier(0, 10)
  }
}

export default GmailGinboxAdaptor
