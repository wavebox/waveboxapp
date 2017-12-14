const MicrosoftService = require('./MicrosoftService')

class MicrosoftStorageService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.STORAGE }
  static get humanizedType () { return 'OneDrive' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_drive_32px.png',
      'microsoft/logo_drive_48px.png',
      'microsoft/logo_drive_64px.png',
      'microsoft/logo_drive_96px.png',
      'microsoft/logo_drive_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () {
    switch (this.accessMode) {
      case this.ACCESS_MODES.OUTLOOK: return 'https://onedrive.live.com/'
      case this.ACCESS_MODES.OFFICE365: return this._value_('driveUrl', 'https://onedrive.live.com/')
    }
  }
}

module.exports = MicrosoftStorageService
