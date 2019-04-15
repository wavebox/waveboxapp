import ServiceReducer from './ServiceReducer'

class TrelloServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'TrelloServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the open board id
  * @param service: the service to update
  * @param boards: the boardId to open with
  */
  static setHomeBoardId (service, boardId) {
    return service.changeData({ homeBoardId: boardId })
  }
}

export default TrelloServiceReducer
