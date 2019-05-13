import BaseAdaptor from './BaseAdaptor'
import { webFrame } from 'electron'
import { UISettings } from 'shared/Models/Settings'
import settingStore from 'stores/settingStore'
import LiveConfig from 'LiveConfig'

class GmailAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get matches () {
    return ['http(s)\\://mail.google.com(*)']
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    if (LiveConfig.platform === 'darwin' && settingStore.ui.vibrancyMode !== UISettings.VIBRANCY_MODES.NONE) {
      webFrame.insertCSS(`
        body, .wl, .aeJ {
          background-color: transparent !important;
        }
      `)
    }
  }
}

export default GmailAdaptor
