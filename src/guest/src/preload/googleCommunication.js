const elconsole = require('../elconsole')
try {
  const GoogleCommunication = require('../Google/GoogleCommunication')
  /*eslint-disable */
  const googleCommunication = new GoogleCommunication()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
