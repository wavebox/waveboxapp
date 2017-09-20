const elconsole = require('../elconsole')
try {
  const CRExtensionLoader = require('../Extensions/Chrome/CRExtensionLoader')
  CRExtensionLoader.load()
} catch (ex) {
  elconsole.error('Error', ex)
}
