class DictionaryProvider {
  /**
  * @override
  * Loads the dictionary synchronously
  * @param lang: the language of the dictionary
  * @return { dic, aff } or undefined
  */
  loadDictionarySync (lang) {
    throw new Error('Not implemented')
  }

  /**
  * Unloads the current dictionary
  */
  unloadDictionarySync () {
    throw new Error('Not implemented')
  }
}

export default DictionaryProvider
