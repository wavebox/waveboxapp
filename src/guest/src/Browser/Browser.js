import KeyboardShim from './KeyboardShim'
import Spellchecker from './Spellchecker'
import Lifecycle from './Lifecycle'
import NotificationProvider from './NotificationProvider'
import ExtensionLoader from './Extensions/ExtensionLoader'
import CRExtensionLoader from './Extensions/CRExtensionLoader'
import UserCodeInjection from './UserCodeInjection'
import WindowCloser from './WindowCloser'

const privStarted = Symbol('privStarted')
const privKeyboardShim = Symbol('privKeyboardShim')
const privSpellchecker = Symbol('privSpellchecker')
const privNotificationProvider = Symbol('privNotificationProvider')
const privUserCodeInjection = Symbol('privUserCodeInjection')
const privLifecycle = Symbol('privLifecycle')
const privCRExtensionLoader = Symbol('privCRExtensionLoader')
const privWindowCloser = Symbol('privWindowCloser')

class Browser {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privStarted] = false

    this[privKeyboardShim] = undefined
    this[privSpellchecker] = undefined
    this[privNotificationProvider] = undefined
    this[privUserCodeInjection] = undefined
    this[privLifecycle] = undefined
    this[privCRExtensionLoader] = undefined
    this[privWindowCloser] = undefined
  }

  /**
  * Starts everything up
  */
  start () {
    if (this[privStarted]) { return }
    this[privStarted] = true

    this[privKeyboardShim] = new KeyboardShim()
    this[privSpellchecker] = new Spellchecker()
    this[privNotificationProvider] = new NotificationProvider()
    this[privUserCodeInjection] = new UserCodeInjection()
    this[privLifecycle] = new Lifecycle()
    this[privWindowCloser] = new WindowCloser()

    // Extensions
    this[privCRExtensionLoader] = new CRExtensionLoader()
    this[privCRExtensionLoader].load()
    ExtensionLoader.loadWaveboxGuestApi(ExtensionLoader.ENDPOINTS.CHROME)
  }
}

export default Browser
