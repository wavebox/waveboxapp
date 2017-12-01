import BaseAdaptor from './BaseAdaptor'

class GoogleDriveAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () { return ['*://drive.google.com*'] }

  /* **************************************************************************/
  // Class: CSS
  /* **************************************************************************/

  static get styles () {
    return `
      .g-Yd.a-la-B.a-Ff-B.g-Yd-Ya.g-Yd-Na { /* Turn on notifications popup */
        display: none !important;
      }
    `
  }
}

export default GoogleDriveAdaptor
