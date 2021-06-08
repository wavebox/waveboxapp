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
  get isPersonalAccount () { return this.authData.isPersonalAccount === true }
  get driveUrl () { return this._value_('driveUrl', undefined) }
  get humanizedNamespace () {
    return this.isPersonalAccount
      ? `${this.constructor.humanizedNamespace} (Personal)`
      : `${this.constructor.humanizedNamespace} (Corporate)`
  }

  /* **************************************************************************/
  // Properties: Identification
  /* **************************************************************************/

  get humanizedIdentifier () { return this.authData.userPrincipalName }
}

export default MicrosoftAuth
