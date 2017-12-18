import BaseAdaptor from './BaseAdaptor'

class GoogleDriveAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://drive.google.com(*)'
    ]
  }

  /* **************************************************************************/
  // Class: CSS
  /* **************************************************************************/

  static get styles () {
    /* Turn on notifications snackbar */
    return `
      .g-Yd.a-la-B.a-Ff-B.g-Yd-Ya.g-Yd-Na {
        display: none !important;
      }
    `
  }
}

export default GoogleDriveAdaptor
