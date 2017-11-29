const Browser = require('../Browser/Browser')
const ChildWindowProvider = require('./ChildWindowProvider')

class Content {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.childWindow = new ChildWindowProvider()
  }
}

module.exports = Content
