const GoogleService = require('./GoogleService')

class GoogleAnalyticsService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.ANALYTICS }
  static get humanizedType () { return 'Google Analytics' }
  static get humanizedTypeShort () { return 'Analytics' }
  static get humanizedLogos () {
    return [
      'google/logo_analytics_32px.png',
      'google/logo_analytics_48px.png',
      'google/logo_analytics_64px.png',
      'google/logo_analytics_96px.png',
      'google/logo_analytics_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://analytics.google.com' }
}

module.exports = GoogleAnalyticsService
