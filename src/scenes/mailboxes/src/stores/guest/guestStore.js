import alt from '../alt'
import actions from './guestActions'

class GuestStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.pageTitles = new Map()

    /* ****************************************/
    // Meta
    /* ****************************************/

    /**
    * Gets the title
    * @param idc: the id components
    * @return the page title or undefined
    */
    this.getPageTitle = (idc) => {
      return this.pageTitles.get(idc.join(':'))
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleSetPageTitle: actions.SET_PAGE_TITLE
    })
  }

  /* **************************************************************************/
  // Handlers : Meta
  /* **************************************************************************/

  handleSetPageTitle ({ idc, title }) {
    this.pageTitles.set(idc.join(':'), title)
  }
}

export default alt.createStore(GuestStore, 'GuestStore')
