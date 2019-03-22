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

  /**
  * Indicates to the store that default values should be reloaded
  */
  reloadDefaults () {
    throw new Error('Action not implemented "regenerateDefaults"')
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

  /* **************************************************************************/
  // Updates: OS
  /* **************************************************************************/

  /**
  * Sets a custom link provider
  * @param providerId: the id of the provider, or undefined to create a new one
  * @param provider: the provider config
  */
  setCustomLinkProvider (...args) {
    if (process.type === 'browser') {
      const [ providerId, provider ] = args
      return { providerId, provider }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setCustomLinkProvider', args)
    }
  }

  /**
  * Removes a custom link provider
  * @param providerId: the id of the provider to remove
  */
  removeCustomLinkProvider (...args) {
    if (process.type === 'browser') {
      const [ providerId ] = args
      return { providerId }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('removeCustomLinkProvider', args)
    }
  }

  /* **************************************************************************/
  // Updates: Tray
  /* **************************************************************************/

  /**
  * Sets the unread image for the tray
  * @param b64Image: the base64 encoded image
  */
  setTrayUnreadImage (...args) {
    if (process.type === 'browser') {
      const [b64Image] = args
      return { b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setTrayUnreadImage', args)
    }
  }

  /**
  * Sets the read image for the tray
  * @param b64Image: the base64 encoded image
  */
  setTrayReadImage (...args) {
    if (process.type === 'browser') {
      const [b64Image] = args
      return { b64Image }
    } else if (process.type === 'renderer') {
      return this.remoteDispatch('setTrayReadImage', args)
    }
  }
}

export default CoreSettingsActions
