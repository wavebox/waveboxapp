import EventUnsupported from 'Core/EventUnsupported'

class Omnibox {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/omnibox
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this.onInputStarted = new EventUnsupported('chrome.omnibox.onInputStarted')
    this.onInputChanged = new EventUnsupported('chrome.omnibox.onInputChanged')
    this.onInputEntered = new EventUnsupported('chrome.omnibox.onInputEntered')
    this.onInputCancelled = new EventUnsupported('chrome.omnibox.onInputCancelled')
    this.onDeleteSuggestion = new EventUnsupported('chrome.omnibox.onDeleteSuggestion')

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  setDefaultSuggestion () {
    console.warn('chrome.omnibox.setDefaultSuggestion is not supported by Wavebox at this time')
  }
}

export default Omnibox
