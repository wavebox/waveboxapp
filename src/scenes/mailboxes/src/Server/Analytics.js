const { GOOGLE_ANALYTICS_ID } = require('R/Bootstrap').credentials
const { ANALYTICS_HEARTBEAT_INTERVAL } = require('shared/constants')
const { userStore } = require('stores/user')
const { mailboxStore } = require('stores/mailbox')
const pkg = window.appPackage()
const querystring = require('querystring')

class Analytics {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.heartbeatTO = null
    this._boundFunctions = {
      appHashChanged: this.appHashChanged.bind(this)
    }
  }

  /* ****************************************************************************/
  // Autoreporting
  /* ****************************************************************************/

  /**
  * Starts auto reporting
  * @return self
  */
  startAutoreporting () {
    this.stopAutoreporting()
    this.heartbeatTO = setInterval(() => {
      this.appHeartbeat()
    }, ANALYTICS_HEARTBEAT_INTERVAL)
    window.addEventListener('hashchange', this._boundFunctions.appHashChanged, false)
    this.appOpened()
  }

  /**
  * Stops auto reporting
  * @return self
  */
  stopAutoreporting () {
    clearTimeout(this.heartbeatTO)
    window.removeEventListener('hashchange', this._boundFunctions.appHashChanged)
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  /**
  * Sends an analytics report.
  * https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
  * @param window: the mailbox window
  * @param args: the items to append
  * @return promise
  */
  send (args) {
    if (!GOOGLE_ANALYTICS_ID) { return Promise.resolve() }

    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()

    const fullArgs = Object.assign({
      v: 1,
      tid: GOOGLE_ANALYTICS_ID,
      cid: userState.analyticsId,
      cd: window.location.hash,
      cd1: mailboxState.mailboxCount(),
      cd2: userState.user.plan,
      t: 'screenview',
      vp: `${window.outerWidth}x${window.outerHeight}`,
      ul: window.navigator.language,
      an: pkg.name,
      ua: window.navigator.userAgent,
      av: process.platform + '-' + pkg.version
    }, args)
    const qs = querystring.stringify(fullArgs)

    const url = 'https://www.google-analytics.com/collect?' + qs
    return window.fetch(url, { method: 'post' })
  }

  /**
  * Log the app was opened
  */
  appOpened () {
    return this.send({ cd2: 'opened' })
  }

  /**
  * Log the app is alive
  */
  appHeartbeat () {
    return this.send({ cd2: 'heartbeat' })
  }

  /**
  * Log the hash changed
  */
  appHashChanged () {
    return this.send({ cd2: 'navigate' })
  }
}

module.exports = new Analytics()
