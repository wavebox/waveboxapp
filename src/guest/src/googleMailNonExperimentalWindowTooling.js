const req = require('./req')
const elconsole = require('./elconsole')
const extensionLoader = require('./Extensions/extensionLoader')
const { WAVEBOX_CONTENT_IMPL_ENDPOINTS } = req.shared('extensionApis')

try {
  const GoogleMail = require('./Google/GoogleMail')
  const googleMail = new GoogleMail()
  if (googleMail.isGmail) {
    extensionLoader.loadWaveboxGuestApi(WAVEBOX_CONTENT_IMPL_ENDPOINTS.GMAIL_NON_EXPERIMENTAL_WINDOW_OPEN)
  }
} catch (ex) {
  elconsole.error('Error', ex)
}
