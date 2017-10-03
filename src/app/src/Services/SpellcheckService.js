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
  * Handles a spellchecker connecting
  * @param evt: the event that fired
  */
  _handleConnect = (evt) => {
    const wc = evt.sender
    const id = wc.id

    wc.on('destroyed', () => { this.connected.delete(id) })
    wc.sendToAll(WB_BROWSER_CONFIGURE_SPELLCHECK, {
      language: settingStore.language.spellcheckerLanguage,
      secondaryLanguage: settingStore.language.secondarySpellcheckerLanguage
    })

    this.connected.add(id)
  }

  /**
  * Handles the language settings changing
  * @param prev: the previous language
  * @param next: the next language
  */
  _handleLanguageSettingsChanged = ({ prev, next }) => {
    if (prev.spellcheckerLanguage !== next.spellcheckerLanguage || prev.secondarySpellcheckerLanguage !== next.secondarySpellcheckerLanguage) {
      Array.from(this.connected).forEach((id) => {
        webContents.fromId(id).send(WB_BROWSER_CONFIGURE_SPELLCHECK, {
          language: next.spellcheckerLanguage,
          secondaryLanguage: next.secondarySpellcheckerLanguage
        })
      })
    }
  }
}

export default SpellcheckService
