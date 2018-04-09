import KeyboardShim from './KeyboardShim'
import Spellchecker from './Spellchecker'
import Lifecycle from './Lifecycle'
import NotificationProvider from './NotificationProvider'
import DialogProvider from './DialogProvider'
import ExtensionLoader from './Extensions/ExtensionLoader'
import CRExtensionLoader from './Extensions/CRExtensionLoader'
import UserCodeInjection from './UserCodeInjection'
import WaveboxApiProvider from './WaveboxApiProvider'

const privStarted = Symbol('privStarted')
const privKeyboardShim = Symbol('privKeyboardShim')
const privSpellchecker = Symbol('privSpellchecker')
const privDialogProvider = Symbol('privDialogProvider')
const privNotificationProvider = Symbol('privNotificationProvider')
const privUserCodeInjection = Symbol('privUserCodeInjection')
const privLifecycle = Symbol('privLifecycle')
const privCRExtensionLoader = Symbol('privCRExtensionLoader')
const privWaveboxApiProvider = Symbol('privWaveboxApiProvider')

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
    this[privLifecycle] = undefined
    this[privCRExtensionLoader] = undefined
    this[privWaveboxApiProvider] = undefined
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
    this[privLifecycle] = new Lifecycle()
    this[privWaveboxApiProvider] = new WaveboxApiProvider()

    // Extensions
    this[privCRExtensionLoader] = new CRExtensionLoader()
    this[privCRExtensionLoader].load()
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.CHROME)
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.NAVIGATOR)
  }
}

export default Browser
