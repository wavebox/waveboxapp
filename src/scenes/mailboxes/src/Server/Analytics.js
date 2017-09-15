import Bootstrap from 'R/Bootstrap'
import { ANALYTICS_HEARTBEAT_INTERVAL } from 'shared/constants'
import { userStore } from 'stores/user'
import { mailboxStore } from 'stores/mailbox'
import settingsStore from 'stores/settings/settingsStore'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import querystring from 'querystring'
import os from 'os'
const pkg = window.appPackage()
const distributionConfig = window.distributionConfig()

class Analytics {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.heartbeatTO = null
    this.lifecycleDefaultArgs = Object.freeze({
      v: 1,
      tid: Bootstrap.credentials.GOOGLE_ANALYTICS_ID,
      cd: 'Wavebox',
      ul: window.navigator.language,
      an: `${pkg.name}:${process.platform}`,
      ua: window.navigator.userAgent,
      av: `${pkg.version}${pkg.earlyBuildId ? '-' + pkg.earlyBuildId : ''}`,
      cd6: process.platform,
      cd7: process.arch,
      cd8: os.release(),
      cd9: distributionConfig.installMethod || 'unknown',
      cd10: pkg.releaseChannel
    })
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
    this.appOpened()
  }

  /**
  * Stops auto reporting
  * @return self
  */
  stopAutoreporting () {
    clearTimeout(this.heartbeatTO)
  }

  /* ****************************************************************************/
  // Transmitters
  /* ****************************************************************************/

  /**
  * Builds the default configuration
  * @return default configuration
  */
  buildDefaultArguments () {
    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()

    return {
      ...this.lifecycleDefaultArgs,
      cid: userState.analyticsId,
      vp: `${window.outerWidth}x${window.outerHeight}`,
      cd1: mailboxState.mailboxCount(),
      cd3: userState.user.plan
    }
  }

  /**
  * Sends an analytics report
  * @param reportEventReason: the type of report we're sending
  * @param args={}: the items to append
  * @param autocatch=true: true to automatically swallow errors
  * @return promise
  */
  sendScreenView (reportEventReason, args = {}, autocatch = true) {
    return this.send({
      ...this.buildDefaultArguments(),
      cd2: reportEventReason,
      t: 'screenview',
      ...args
    }, autocatch)
  }

  /**
  * Sends an analytics event
  * @param reportEventReason: the type of report we're sending
  * @param args={}: items to append
  * @param autocatch=true: true to automatically swallow errors
  */
  sendEvent (reportEventReason, args = {}, autocatch = true) {
    return this.send({
      ...this.buildDefaultArguments(),
      cd2: reportEventReason,
      t: 'event',
      ...args
    }, autocatch)
  }

  /**
  * Sends an account spread event
  * @param reportEventReason: the type of report we're sending
  * @param autocatch=true: true to automatically swallow errors
  */
  sendAccountSpreadEvent (reportEventReason, autocatch = true) {
    const mailboxState = mailboxStore.getState()
    const spreadString = Object.keys(CoreMailbox.MAILBOX_TYPES)
      .sort()
      .map((type) => `${type}=${mailboxState.getMailboxesOfType(type).length}`)
      .join('&')

    return this.sendEvent(reportEventReason, {
      ni: 0,
      ec: 'account_spread',
      ea: spreadString
    }, autocatch)
  }

  /**
  * Sends the info about the current state of experimental settings
  * @param reportEventReason: the type of report we're sending
  * @param autocatch=true: true to automatically swallow errors
  */
  sendExperimentalConfigEvent (reportEventReason, autocatch = true) {
    const settingsState = settingsStore.getState()
    const experimentalString = [
      'windowOpener=' + settingsState.app.useExperimentalWindowOpener,
      'notifications=' + settingsState.os.notificationsProvider,
      'crextensions=' + settingsState.extension.enableChromeExperimental
    ].join('&')

    return this.sendEvent(reportEventReason, {
      ni: 0,
      ec: 'experimental',
      ea: experimentalString
    }, autocatch)
  }

  /**
  * Sends the message down the pipe
  * https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
  * https://ga-dev-tools.appspot.com/hit-builder/
  * @param args: the full arguments
  * @param autocatch=true: true to automatically swallow errors
  * @return promise
  */
  send (args, autocatch = true) {
    if (!Bootstrap.credentials.GOOGLE_ANALYTICS_ID) {
      const error = new Error('No Anayltics ID specified')
      return autocatch ? Promise.resolve({ sent: false, error: error }) : Promise.reject(error)
    }
    const qs = querystring.stringify(args)
    const url = 'https://www.google-analytics.com/collect?' + qs
    return Promise.resolve()
      .then(() => window.fetch(url, { method: 'POST' }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .catch((err) => autocatch ? Promise.resolve({ sent: false, error: err }) : Promise.reject(err))
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  /**
  * Log the app was opened
  */
  appOpened () {
    return Promise.resolve()
      .then(() => this.sendScreenView('opened', undefined, true))
      .then(() => this.sendAccountSpreadEvent('opened', true))
      .then(() => this.sendExperimentalConfigEvent('opened', true))
  }

  /**
  * Log the app is alive
  */
  appHeartbeat () {
    return this.sendScreenView('heartbeat', undefined, true)
  }
}

export default new Analytics()
