const GoogleService = require('./GoogleService')

class GoogleMusicService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.MUSIC }
  static get humanizedType () { return 'Google Play Music' }
  static get humanizedTypeShort () { return 'Music' }
  static get humanizedLogos () {
    return [
      'images/google/logo_music_32px.png',
      'images/google/logo_music_48px.png',
      'images/google/logo_music_64px.png',
      'images/google/logo_music_128px.png'
    ]
  }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsGuestNotifications () { return true }
  static get supportsTrayMessages () { return true }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this service
  * @return a vanilla js object representing the data for this service
  */
  static createJS () {
    return Object.assign({}, super.createJS(), {
      // We need this because the music will stop
      // playing if the service goes to sleep
      sleepable: false
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://play.google.com/music' }

  get hasUnreadActivity () { return this._value_('lastUnseenNotificationTime', null) !== null }
}

module.exports = GoogleMusicService
