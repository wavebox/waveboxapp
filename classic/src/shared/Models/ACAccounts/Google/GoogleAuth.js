import CoreACAuth from '../CoreACAuth'

class GoogleAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.google' }
  static get humanizedNamespace () { return 'Google' }
}

export default GoogleAuth
