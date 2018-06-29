import CoreACAuth from '../CoreACAuth'

class GoogleAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.google' }

  /* **************************************************************************/
  // Auth data
  /* **************************************************************************/

  get accessToken () { return this.authData.access_token }
  get refreshToken () { return this.authData.refresh_token }
  get authExpiryTime () {
    return (this.authData.date || 0) + ((this.authData.expires_in || 0) * 999)
  }
  get authEmail () { return this.authData.email }
  get pushToken () { return this.authData.pushToken }
}

export default GoogleAuth
