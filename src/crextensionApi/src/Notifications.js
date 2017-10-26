import EventUnsupported from 'Core/EventUnsupported'
import ArgParser from 'Core/ArgParser'
import uuid from 'uuid'

class Notifications {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/notifications
  * @param extensionId: the id of the extension
  */
  constructor (extensionId) {
    this.onClosed = new EventUnsupported('chrome.notifications.onClosed')
    this.onClicked = new EventUnsupported('chrome.notifications.onClicked')
    this.onButtonClicked = new EventUnsupported('chrome.notifications.onButtonClicked')
    this.onPermissionLevelChanged = new EventUnsupported('chrome.notifications.onPermissionLevelChanged')
    this.onShowSettings = new EventUnsupported('chrome.notifications.onShowSettings')

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  create (...fullArgs) {
    const { callback, args } = ArgParser.callback(fullArgs)
    const [notificationId, options] = ArgParser.match(args, [
      { pattern: ['string', 'object'], out: [ArgParser.MATCH_ARG_0, ArgParser.MATCH_ARG_1] },
      { pattern: ['object'], out: [uuid.v4(), ArgParser.MATCH_ARG_1] }
    ])

    console.warn('chrome.notifications.create is not supported by Wavebox at this time', options)
    if (callback) {
      setTimeout(() => callback(notificationId))
    }
  }

  update (notificationId, options, callback) {
    console.warn('chrome.notifications.update is not supported by Wavebox at this time')
    if (callback) {
      const res = true
      setTimeout(() => callback(res))
    }
  }

  clear (notificationId, callback) {
    console.warn('chrome.notifications.clear is not supported by Wavebox at this time')
    if (callback) {
      const res = true
      setTimeout(() => callback(res))
    }
  }

  getAll (callback) {
    console.warn('chrome.notifications.getAll is not supported by Wavebox at this time')
    if (callback) {
      const res = {}
      setTimeout(() => callback(res))
    }
  }

  getPermissionLevel (callback) {
    console.warn('chrome.notifications.getPermissionLevel is not supported by Wavebox at this time')
    if (callback) {
      const res = 'denied'
      setTimeout(() => callback(res))
    }
  }
}

export default Notifications
