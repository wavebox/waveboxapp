const elconsole = require('../elconsole')
try {
  const Content = require('../Content/Content')
  /*eslint-disable */
  const content = new Content()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
