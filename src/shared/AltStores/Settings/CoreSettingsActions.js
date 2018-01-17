import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltSettingsIdentifiers'

class CoreSettingsActions extends RemoteActions {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () {
    throw new Error('Action not implemented "load"')
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Updates a value
  * @param segment: the segment to update
  * @param changesetOrKey: either a dict of k -> or a single key
  * @param undefinedOrVal: if changesetOrKey is a key, this should be the value
  */
  mergeSettingsModelChangeset (segment, changesetOrKey, undefinedOrVal) {
    throw new Error('Action not implemented "mergeSettingsModelChangeset"')
  }

  /**
  * Toggles a value in a settings model field
  * @param segment: the segment to update
  * @param key: the key to toggle
  */
  toggleSettingsModelField (segment, key) {
    throw new Error('Action not implemented "toggleSettingsModelField"')
  }

  /* **************************************************************************/
  // Updates: language
  /* **************************************************************************/

  /**
  * @param lang: the language to set to
  */
  setSpellcheckerLanguage (lang) {
    throw new Error('Action not implemented "setSpellcheckerLanguage"')
  }

  /**
  * @param lang: the language to set to
  */
  setSecondarySpellcheckerLanguage (lang) {
    throw new Error('Action not implemented "setSecondarySpellcheckerLanguage"')
  }

  /* **************************************************************************/
  // Updates: App
  /* **************************************************************************/

  /**
  * Takes the current channel of the app and glues it to the user update channel
  */
  glueCurrentUpdateChannel () {
    throw new Error('Action not implemented "glueCurrentUpdateChannel"')
  }
}

export default CoreSettingsActions
