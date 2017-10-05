import { ipcMain, webContents } from 'electron'
import {
  WB_BROWSER_CONNECT_SPELLCHECK,
  WB_BROWSER_CONFIGURE_SPELLCHECK
} from 'shared/ipcEvents'
import settingStore from 'stores/settingStore'
import { SEGMENTS } from 'shared/Models/Settings/SettingsIdent'

class SpellcheckService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.connected = new Set()

    ipcMain.on(WB_BROWSER_CONNECT_SPELLCHECK, this._handleConnect)
    settingStore.on(`changed:${SEGMENTS.LANGUAGE}`, this._handleLanguageSettingsChanged)
  }

  load () { /* no-op */ }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Builds the payload for the spellcheck engine
  * @param language: the language object to build from
  * @return a payload that can be sent to the guest view
  */
  _buildPayload (language) {
    if (language.spellcheckerEnabled) {
      return {
        language: language.spellcheckerLanguage,
        secondaryLanguage: language.secondarySpellcheckerLanguage
      }
    } else {
      return {
        language: null,
        secondaryLanguage: null
      }
    }
  }

  /**
  * Handles a spellchecker connecting
  * @param evt: the event that fired
  */
  _handleConnect = (evt) => {
    const wc = evt.sender
    const id = wc.id

    wc.on('destroyed', () => { this.connected.delete(id) })
    wc.on('dom-ready', () => { // Content popup windows seem to be more reliable with this
      wc.sendToAll(WB_BROWSER_CONFIGURE_SPELLCHECK, this._buildPayload(settingStore.language))
    })
    wc.sendToAll(WB_BROWSER_CONFIGURE_SPELLCHECK, this._buildPayload(settingStore.language))

    this.connected.add(id)
  }

  /**
  * Handles the language settings changing
  * @param prev: the previous language
  * @param next: the next language
  */
  _handleLanguageSettingsChanged = ({ prev, next }) => {
    const changed = [
      'spellcheckerEnabled',
      'spellcheckerLanguage',
      'secondarySpellcheckerLanguage'
    ].find((k) => prev[k] !== next[k])

    if (changed) {
      const payload = this._buildPayload(next)
      Array.from(this.connected).forEach((id) => {
        webContents.fromId(id).send(WB_BROWSER_CONFIGURE_SPELLCHECK, payload)
      })
    }
  }
}

export default SpellcheckService
