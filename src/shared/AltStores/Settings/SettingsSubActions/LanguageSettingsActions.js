import { SettingsIdent } from '../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'

class LanguageSettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.LANGUAGE, actions)
  }

  /* **************************************************************************/
  // Dispatch
  /* **************************************************************************/

  /**
  * @param enabled: true to enable the spell checker, false otherwise
  */
  setEnableSpellchecker (enabled) {
    this.dispatchUpdate('spellcheckerEnabled', enabled)
  }

  /**
  * @param lang: the language to set to
  */
  setSpellcheckerLanguage (lang) {
    this.actions.setSpellcheckerLanguage(lang)
  }

  /**
  * @param lang: the language to set to
  */
  setSecondarySpellcheckerLanguage (lang) {
    this.actions.setSecondarySpellcheckerLanguage(lang)
  }
}

export default LanguageSettingsActions
