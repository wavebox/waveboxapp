import RemoteActions from '../RemoteActions'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltSettingsIdentifiers'

class CoreSettingsActions extends RemoteActions {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get displayName () { return ACTIONS_NAME }

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
  mergeSettingsModelChangeset (...args) {
    if (process.type === 'browser') {
      const [segment, changesetOrKey, undefinedOrVal] = args
      if (typeof (changesetOrKey) === 'string') {
        const changeset = {}
        changeset[changesetOrKey] = undefinedOrVal
        return { id: segment, changeset: changeset }
      } else {
        return { id: segment, changeset: changesetOrKey }
      }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('mergeSettingsModelChangeset', args)
    }
  }

  /**
  * Toggles a value in a settings model field
  * @param segment: the segment to update
  * @param key: the key to toggle
  */
  toggleSettingsModelField (...args) {
    if (process.type === 'browser') {
      const [segment, key] = args
      return { id: segment, key: key }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('toggleSettingsModelField', args)
    }
  }

  /**
  * Removes a value in settings field
  * @param segment: the segment to update
  * @param key: the key to remove
  */
  removeSettingsModelField (...args) {
    if (process.type === 'browser') {
      const [segment, key] = args
      return { id: segment, key: key }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('removeSettingsModelField', args)
    }
  }

  /* **************************************************************************/
  // Updates: language
  /* **************************************************************************/

  /**
  * @param lang: the language to set to
  */
  setSpellcheckerLanguage (...args) {
    if (process.type === 'browser') {
      const [lang] = args
      return { lang }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setSpellcheckerLanguage', args)
    }
  }

  /**
  * @param lang: the language to set to
  */
  setSecondarySpellcheckerLanguage (...args) {
    if (process.type === 'browser') {
      const [lang] = args
      return { lang }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setSecondarySpellcheckerLanguage', args)
    }
  }

  /* **************************************************************************/
  // Updates: App
  /* **************************************************************************/

  /**
  * Takes the current channel of the app and glues it to the user update channel
  */
  glueCurrentUpdateChannel (...args) {
    if (process.type === 'browser') {
      return {}
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('glueCurrentUpdateChannel', args)
    }
  }
}

export default CoreSettingsActions
