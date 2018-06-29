import CoreACAuth from '../CoreACAuth'

class TrelloAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.trello' }

  /* **************************************************************************/
  // Auth data
  /* **************************************************************************/

  get authAppKey () { return this.authData.authAppKey }
  get authToken () { return this.authData.authToken }
}

export default TrelloAuth
