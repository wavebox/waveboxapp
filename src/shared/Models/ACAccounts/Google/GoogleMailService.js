import CoreGoogleMailService from './CoreGoogleMailService'

class GoogleMailService extends CoreGoogleMailService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreGoogleMailService.SERVICE_TYPES.GOOGLE_MAIL }
}

export default GoogleMailService
