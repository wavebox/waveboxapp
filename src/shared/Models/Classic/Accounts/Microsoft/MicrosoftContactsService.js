const MicrosoftService = require('./MicrosoftService')

class MicrosoftContactsService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.CONTACTS }
  static get humanizedType () { return 'People' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_contacts_32px.png',
      'microsoft/logo_contacts_48px.png',
      'microsoft/logo_contacts_64px.png',
      'microsoft/logo_contacts_96px.png',
      'microsoft/logo_contacts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () {
    switch (this.accessMode) {
      case this.ACCESS_MODES.OUTLOOK: return 'https://outlook.com/owa/?path=/people'
      case this.ACCESS_MODES.OFFICE365: return 'https://outlook.office365.com/owa/?path=/people'
    }
  }
}

module.exports = MicrosoftContactsService
