const MicrosoftService = require('./MicrosoftService')

class MicrosoftNotesService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.NOTES }
  static get humanizedType () { return 'Tasks' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_tasks_32px.png',
      'microsoft/logo_tasks_48px.png',
      'microsoft/logo_tasks_64px.png',
      'microsoft/logo_tasks_96px.png',
      'microsoft/logo_tasks_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () {
    switch (this.accessMode) {
      case this.ACCESS_MODES.OUTLOOK: return 'https://outlook.com/owa/?path=/tasks'
      case this.ACCESS_MODES.OFFICE365: return 'https://outlook.office365.com/owa/?path=/tasks'
    }
  }
}

module.exports = MicrosoftNotesService
