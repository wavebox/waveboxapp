const MicrosoftService = require('./MicrosoftService')

class MicrosoftNotebookService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.NOTEBOOK }
  static get humanizedType () { return 'OneNote' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_notebook_32px.png',
      'microsoft/logo_notebook_48px.png',
      'microsoft/logo_notebook_64px.png',
      'microsoft/logo_notebook_96px.png',
      'microsoft/logo_notebook_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'http://www.onenote.com/notebooks' }
}

module.exports = MicrosoftNotebookService
