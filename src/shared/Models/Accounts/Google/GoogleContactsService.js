const GoogleService = require('./GoogleService')

class GoogleContactsService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.CONTACTS }
  static get humanizedType () { return 'Google Contacts' }
  static get humanizedTypeShort () { return 'Contacts' }
  static get humanizedLogos () {
    return [
      'images/google/logo_contacts_32px.png',
      'images/google/logo_contacts_48px.png',
      'images/google/logo_contacts_64px.png',
      'images/google/logo_contacts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://contacts.google.com' }
}

module.exports = GoogleContactsService
