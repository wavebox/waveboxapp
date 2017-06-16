const elconsole = require('./elconsole')
try {
  const GoogleStorage = require('./Google/GoogleStorage')
  /*eslint-disable */
  const googleStorage = new GoogleStorage()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
