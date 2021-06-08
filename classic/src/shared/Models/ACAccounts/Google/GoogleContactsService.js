import CoreACService from '../CoreACService'

class GoogleContactsService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_CONTACTS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Contacts' }
  static get humanizedTypeShort () { return 'Contacts' }
  static get humanizedLogos () {
    return [
      'google/logo_contacts_32px.png',
      'google/logo_contacts_48px.png',
      'google/logo_contacts_64px.png',
      'google/logo_contacts_96px.png',
      'google/logo_contacts_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(60, 173, 244)' }

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
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://contacts.google.com' }
}

export default GoogleContactsService
