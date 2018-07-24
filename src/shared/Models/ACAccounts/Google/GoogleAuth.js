import CoreACAuth from '../CoreACAuth'

class GoogleAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.google' }
  static get humanizedNamespace () { return 'Google' }

  /* **************************************************************************/
  // Auth data
  /* **************************************************************************/

  get accessToken () { return this.authData.access_token }
  get refreshToken () { return this.authData.refresh_token }
  get authTime () { return this.authData.date }
  get authExpiryTime () {
    return (this.authTime || 0) + ((this.authData.expires_in || 0) * 999)
  }
  get authEmail () { return this.authData.email }
  get pushToken () { return this.authData.pushToken }

  /* **************************************************************************/
  // Properties: Identification
  /* **************************************************************************/

  get humanizedIdentifier () { return this.authEmail }
}

export default GoogleAuth
