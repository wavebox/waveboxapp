const GoogleService = require('./GoogleService')

class GoogleSheetsService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.SHEETS }
  static get humanizedType () { return 'Google Sheets' }
  static get humanizedTypeShort () { return 'Sheets' }
  static get humanizedLogos () {
    return [
      'images/google/logo_sheets_32px.png',
      'images/google/logo_sheets_48px.png',
      'images/google/logo_sheets_64px.png',
      'images/google/logo_sheets_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://sheets.google.com' }
}

module.exports = GoogleSheetsService
