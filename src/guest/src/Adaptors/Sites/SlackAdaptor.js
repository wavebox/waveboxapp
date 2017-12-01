import BaseAdaptor from './BaseAdaptor'

class SlackAdapator extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () { return ['*://*.slack.com*'] }

  /* **************************************************************************/
  // Class: CSS
  /* **************************************************************************/

  static get styles () { return '#macssb1_banner { display:none; }' }
}

export default SlackAdapator
