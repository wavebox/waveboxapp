import CoreACAuth from '../CoreACAuth'

class TrelloAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.trello' }
  static get humanizedNamespace () { return 'Trello' }
}

export default TrelloAuth
