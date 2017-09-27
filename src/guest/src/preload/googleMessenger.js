const elconsole = require('../elconsole')
try {
  const GoogleMessenger = require('../Google/GoogleMessenger')
  /*eslint-disable */
  const googleMessenger = new GoogleMessenger()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
