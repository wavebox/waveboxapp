import CoreACService from '../CoreACService'

class GoogleContactsService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_CONTACTS }

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

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Google Contacts' }
  get humanizedTypeShort () { return 'Contacts' }
  get humanizedLogos () {
    return [
      'google/logo_contacts_32px.png',
      'google/logo_contacts_48px.png',
      'google/logo_contacts_64px.png',
      'google/logo_contacts_96px.png',
      'google/logo_contacts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://contacts.google.com' }
}

export default GoogleContactsService
