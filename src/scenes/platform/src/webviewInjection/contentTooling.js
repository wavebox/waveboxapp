const elconsole = require('./elconsole')
try {
  const Browser = require('./Browser/Browser')
  const WMail = require('./WMail/WMail')
  /*eslint-disable */
  const browser = new Browser()
  const wmail = new WMail()
  /*eslint-enable */

  window.chrome = {}
} catch (ex) {
  elconsole.error('Error', ex)
}
