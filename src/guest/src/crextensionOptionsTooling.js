const elconsole = require('./elconsole')
try {
  const CRExtensionOptions = require('./Extensions/Chrome/CRExtensionOptions')
  /*eslint-disable */
  const crextensionOptions = new CRExtensionOptions()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
