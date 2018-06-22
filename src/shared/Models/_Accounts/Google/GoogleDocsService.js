const GoogleService = require('./GoogleService')

class GoogleDocsService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.DOCS }
  static get humanizedType () { return 'Google Docs' }
  static get humanizedTypeShort () { return 'Docs' }
  static get humanizedLogos () {
    return [
      'google/logo_docs_32px.png',
      'google/logo_docs_48px.png',
      'google/logo_docs_64px.png',
      'google/logo_docs_96px.png',
      'google/logo_docs_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://docs.google.com' }
}

module.exports = GoogleDocsService
