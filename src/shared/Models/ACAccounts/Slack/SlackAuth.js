import CoreACAuth from '../CoreACAuth'

class SlackAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.slack' }
}

export default SlackAuth
