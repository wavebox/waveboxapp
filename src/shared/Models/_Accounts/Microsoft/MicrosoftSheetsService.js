const MicrosoftService = require('./MicrosoftService')

class MicrosoftSheetsService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.SHEETS }
  static get humanizedType () { return 'Excel' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_sheets_32px.png',
      'microsoft/logo_sheets_48px.png',
      'microsoft/logo_sheets_64px.png',
      'microsoft/logo_sheets_96px.png',
      'microsoft/logo_sheets_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://office.live.com/start/Excel.aspx' }
}

module.exports = MicrosoftSheetsService
