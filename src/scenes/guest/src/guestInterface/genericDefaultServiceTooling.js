const elconsole = require('./elconsole')
try {
  const GenericDefaultService = require('./Generic/GenericDefaultService')
  /*eslint-disable */
  const genericDefaultService = new GenericDefaultService()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
