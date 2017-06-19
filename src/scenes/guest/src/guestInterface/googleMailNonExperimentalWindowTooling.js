const req = require('./req')
const elconsole = require('./elconsole')
const injector = require('./injector')
const { WAVEBOX_GUEST_APIS } = req.shared('guestApis')

try {
  const GoogleMail = require('./Google/GoogleMail')
  const googleMail = new GoogleMail()
  if (googleMail.isGmail) {
    injector.injectWaveboxApi(WAVEBOX_GUEST_APIS.GMAIL_WINDOW_OPEN)
  }
} catch (ex) {
  elconsole.error('Error', ex)
}
