import CoreACService from '../CoreACService'

class GoogleDocsService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.GOOGLE_DOCS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Docs' }
  static get humanizedTypeShort () { return 'Docs' }
  static get humanizedLogos () {
    return [
      'google/logo_docs_32px.png',
      'google/logo_docs_48px.png',
      'google/logo_docs_64px.png',
      'google/logo_docs_96px.png',
      'google/logo_docs_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(79, 142, 245)' }

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

  get url () { return 'https://docs.google.com' }
}

export default GoogleDocsService
