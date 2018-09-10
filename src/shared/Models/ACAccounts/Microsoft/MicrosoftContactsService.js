import MicrosoftService from './MicrosoftService'

class MicrosoftContactsService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_CONTACTS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

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
  static get humanizedColor () { return 'rgb(195, 86, 54)' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return false }
  get supportsTrayMessages () { return false }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return false }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return 'com.microsoft' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get personalUrl () { return 'https://outlook.com/owa/?path=/people' }
  get corporateUrl () { return 'https://outlook.office365.com/owa/?path=/people' }
}

export default MicrosoftContactsService
