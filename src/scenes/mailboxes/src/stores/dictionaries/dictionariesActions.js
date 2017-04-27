import alt from '../alt'
import uuid from 'uuid'

class DictionariesActions {
  /* **************************************************************************/
  // Changing
  /* **************************************************************************/

  /**
  * Starts the dictionary process
  * @return { id }
  */
  startDictionaryInstall () {
    return { id: uuid.v4() }
  }

  /**
  * Cancels the dictionary change
  */
  stopDictionaryInstall () {
    return { }
  }

  /**
  * Finishes the dictionary change
  */
  completeDictionaryInstall () {
    return { }
  }

  /**
  * Starts the dictionary process
  * @param id: the change id for validation
  * @param lang: the lang code to change to
  */
  pickDictionaryInstallLanguage (id, lang) {
    return { id: id, lang: lang }
  }

  /**
  * Starts the dictionary install
  * @param id: the change id for validation
  */
  installDictionary (id) {
    return { id: id }
  }
}

export default alt.createActions(DictionariesActions)
