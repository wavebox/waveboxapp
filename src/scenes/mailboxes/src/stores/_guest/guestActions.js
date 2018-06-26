import alt from '../alt'

class GuestActions {
  /* **************************************************************************/
  // Meta
  /* **************************************************************************/

  /**
  * Sets the title
  * @param idc: the id components
  * @param title: the new title
  */
  setPageTitle (idc, title) {
    return { idc: idc, title: title }
  }
}

export default alt.createActions(GuestActions)
