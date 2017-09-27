const elconsole = require('../elconsole')
try {
  const GoogleCalendar = require('../Google/GoogleCalendar')
  /*eslint-disable */
  const googleCalendar = new GoogleCalendar()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
