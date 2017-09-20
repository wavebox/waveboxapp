const elconsole = require('../elconsole')
try {
  const MicrosoftStorageService = require('../Microsoft/MicrosoftStorageService')
  /*eslint-disable */
  const microsoftService = new MicrosoftStorageService()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
