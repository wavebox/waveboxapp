import MicrosoftService from './MicrosoftService'

class MicrosoftContactsService extends MicrosoftService {
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
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Contacts' }
  get humanizedLogos () {
    return [
      'microsoft/logo_contacts_32px.png',
      'microsoft/logo_contacts_48px.png',
      'microsoft/logo_contacts_64px.png',
      'microsoft/logo_contacts_96px.png',
      'microsoft/logo_contacts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return 'https://outlook.com/owa/?path=/people' }
  get o365Url () { return 'https://outlook.office365.com/owa/?path=/people' }
}

export default MicrosoftContactsService
