import CoreACAuth from '../CoreACAuth'

class MicrosoftAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.microsoft' }
  static get humanizedNamespace () { return 'Microsoft' }

  /* **************************************************************************/
  // Auth data
  /* **************************************************************************/

  get authTime () { return this.authData.date }
  get accessToken () { return this.authData.access_token }
  get refreshToken () { return this.authData.refresh_token }
  get authExpiryTime () { return (this.authData.date || 0) + ((this.authData.expires_in || 0) * 999) }
  get authProtocolVersion () { return this.authData.protocolVersion || 1 }
  get accessMode () { return this.authData.accessMode }
  get driveUrl () { return this.authData.driveUrl }
}

export default MicrosoftAuth
