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
  * Sets the board info for this account
  * @param service: the service to update
  * @param boards: the boards to set
  */
  static setBoards (service, boards) {
    return service.changeData({ boards: boards })
  }

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
