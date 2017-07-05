const elconsole = require('./elconsole')
try {
  const Browser = require('./Browser/Browser')
  const Wavebox = require('./Wavebox/Wavebox')
  /*eslint-disable */
  const browser = new Browser()
  const wavebox = new Wavebox()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
