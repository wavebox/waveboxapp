const elconsole = require('./elconsole')
const path = require('path')
const injector = require('./injector')
try {
  const GoogleMail = require('./Google/GoogleMail')
  const googleMail = new GoogleMail()
  if (googleMail.isGmail) {
    injector.injectClientModule(path.join(__dirname, './Google/Client/GmailWindowOpen.js'))
  }
} catch (ex) {
  elconsole.error('Error', ex)
}
