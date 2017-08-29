const MicrosoftService = require('./MicrosoftService')

class MicrosoftStorageService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.STORAGE }
  static get humanizedType () { return 'OneDrive' }
  static get humanizedLogos () {
    return [
      'images/microsoft/logo_drive_32px.png',
      'images/microsoft/logo_drive_48px.png',
      'images/microsoft/logo_drive_64px.png',
      'images/microsoft/logo_drive_128px.png'
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

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the navigate mode for a url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @return the navigate mode
  */
  getNavigateModeForUrl (url, parsedUrl) {
    // Outlook
    if (parsedUrl.hostname === 'onedrive.live.com') {
      if (parsedUrl.pathname === '/edit.aspx') {
        // Editing document
        return this.constructor.NAVIGATE_MODES.OPEN_CONTENT
      } else if (parsedUrl.pathname === '/download.aspx') {
        // Opening PDFs in browser. View original image
        return this.constructor.NAVIGATE_MODES.OPEN_CONTENT
      }
    } else if (parsedUrl.hostname.endsWith('.files.1drv.com')) {
      // ?
      return this.constructor.NAVIGATE_MODES.OPEN_CONTENT
    }

    // Office 365
    if (parsedUrl.hostname.endsWith('.sharepoint.com')) {
      if (parsedUrl.pathname.endsWith('WopiFrame.aspx')) {
        // ?
        return this.constructor.NAVIGATE_MODES.OPEN_CONTENT
      }
    }

    return super.getNavigateModeForUrl(url, parsedUrl)
  }
}

module.exports = MicrosoftStorageService
