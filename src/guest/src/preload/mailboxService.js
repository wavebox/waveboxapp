const elconsole = require('../elconsole')
try {
  const Browser = require('../Browser/Browser')
  /*eslint-disable */
  const browser = new Browser()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
