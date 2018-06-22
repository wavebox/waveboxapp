const MicrosoftService = require('./MicrosoftService')

class MicrosoftTaskService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.TASK }
  static get humanizedType () { return 'Todo' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_todo_32px.png',
      'microsoft/logo_todo_48px.png',
      'microsoft/logo_todo_64px.png',
      'microsoft/logo_todo_96px.png',
      'microsoft/logo_todo_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () {
    // Microsoft todo seems to have trouble redirecting us to our language. However
    // placing an asterisk at the end of the url works around this.
    // In addition to this "todo."" only seems to work for outlook and "to-do." only
    // seems to work for O365
    switch (this.accessMode) {
      case this.ACCESS_MODES.OUTLOOK: return 'https://todo.microsoft.com/*'
      case this.ACCESS_MODES.OFFICE365: return 'https://to-do.microsoft.com/*'
    }
  }
}

module.exports = MicrosoftTaskService
