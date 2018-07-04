const MicrosoftService = require('./MicrosoftService')

class MicrosoftDocsService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.DOCS }
  static get humanizedType () { return 'Word' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_docs_32px.png',
      'microsoft/logo_docs_48px.png',
      'microsoft/logo_docs_64px.png',
      'microsoft/logo_docs_96px.png',
      'microsoft/logo_docs_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://office.live.com/start/Word.aspx' }
}

module.exports = MicrosoftDocsService
