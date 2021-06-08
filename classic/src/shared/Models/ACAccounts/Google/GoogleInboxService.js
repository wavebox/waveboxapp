import CoreGoogleMailService from './CoreGoogleMailService'

class GoogleInboxService extends CoreGoogleMailService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreGoogleMailService.SERVICE_TYPES.GOOGLE_INBOX }

  /* **************************************************************************/
  // Properties: Deprication
  /* **************************************************************************/

  get ginboxSeenRetirementVersion () { return this._value_('ginboxSeenRetirementVersion', 0) }
}

export default GoogleInboxService
