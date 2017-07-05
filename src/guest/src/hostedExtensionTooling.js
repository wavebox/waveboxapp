const elconsole = require('./elconsole')
try {
  const HostedExtension = require('./HostedExtension/HostedExtension')
  /*eslint-disable */
  const hostedExtension = new HostedExtension()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
