import BaseAdaptor from './BaseAdaptor'

class OutlookAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://outlook.office365.com(/*)',
      'http(s)\\://outlook.live.com(/*)'
    ]
  }

  /* **************************************************************************/
  // Class: CSS
  /* **************************************************************************/

  static get styles () {
    /* Fix styling issue when integrations/add-ins have been added. e.g. trello */
    return `
      .ms-Panel-main>.ms-Panel-contentInner>.ms-Panel-scrollableContent[data-is-scrollable="true"] {
        height: 100%;
      }
    `
  }
}

export default OutlookAdaptor
