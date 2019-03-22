import KeyboardShim from './KeyboardShim'
import Spellchecker from './Spellchecker'
import NotificationProvider from './NotificationProvider'
import DialogProvider from './DialogProvider'
import ExtensionLoader from './Extensions/ExtensionLoader'
import CRExtensionLoader from './Extensions/CRExtensionLoader'
import UserCodeInjection from './UserCodeInjection'
import WaveboxApiProvider from './WaveboxApiProvider'
import VisualZoomProvider from './VisualZoomProvider'

const privStarted = Symbol('privStarted')
const privKeyboardShim = Symbol('privKeyboardShim')
const privSpellchecker = Symbol('privSpellchecker')
const privDialogProvider = Symbol('privDialogProvider')
const privNotificationProvider = Symbol('privNotificationProvider')
const privUserCodeInjection = Symbol('privUserCodeInjection')
const privCRExtensionLoader = Symbol('privCRExtensionLoader')
const privWaveboxApiProvider = Symbol('privWaveboxApiProvider')
const privVisualZoomProvider = Symbol('privVisualZoomProvider')

class Browser {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privStarted] = false

    this[privKeyboardShim] = undefined
    this[privSpellchecker] = undefined
    this[privDialogProvider] = undefined
    this[privNotificationProvider] = undefined
    this[privUserCodeInjection] = undefined
    this[privCRExtensionLoader] = undefined
    this[privWaveboxApiProvider] = undefined
    this[privVisualZoomProvider] = undefined
  }

  /**
  * Starts everything up
  */
  start () {
    if (this[privStarted]) { return }
    this[privStarted] = true

    this[privKeyboardShim] = new KeyboardShim()
    this[privSpellchecker] = new Spellchecker()
    this[privDialogProvider] = new DialogProvider()
    this[privNotificationProvider] = new NotificationProvider()
    this[privUserCodeInjection] = new UserCodeInjection()
    this[privWaveboxApiProvider] = new WaveboxApiProvider()
    this[privVisualZoomProvider] = new VisualZoomProvider()

    // Extensions
    this[privCRExtensionLoader] = new CRExtensionLoader()
    this[privCRExtensionLoader].load()
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.CHROME)
  }
}

export default Browser
