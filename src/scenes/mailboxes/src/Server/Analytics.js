import { ipcRenderer } from 'electron'
import Bootstrap from 'R/Bootstrap'
import { userStore } from 'stores/user'
import { accountStore } from 'stores/account'
import { crextensionStore } from 'stores/crextension'
import settingsStore from 'stores/settings/settingsStore'
import SettingsIdent from 'shared/Models/Settings/SettingsIdent'
import querystring from 'querystring'
import os from 'os'
import { URL } from 'url'
import pkg from 'package.json'
import DistributionConfig from 'Runtime/DistributionConfig'
import {
  ANALYTICS_HEARTBEAT_INTERVAL,
  ANALYTICS_RESOURCE_INTERVAL,
  ANALYTICS_CONFIG_INTERVAL
} from 'shared/constants'
import {
  WB_METRICS_GET_CHROMIUM_METRICS_SYNC
} from 'shared/ipcEvents'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

const privAutoreportTO = Symbol('privAutoreportTO')
const privLifecycleArgs = Symbol('privLifecycleArgs')

class Analytics {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privAutoreportTO] = {
      heartbeat: null,
      resource: null,
      config: null
    }
    this[privLifecycleArgs] = {
      ga: Object.freeze({
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
        cd9: DistributionConfig.installMethod,
        cd10: pkg.releaseChannel
      }),
      wb: Object.freeze({
        _analyticsId: Bootstrap.credentials.GOOGLE_ANALYTICS_ID,
        _language: window.navigator.language,
        _userAgent: window.navigator.userAgent,
        _name: pkg.name,
        _version: pkg.version,
        _releaseChannel: pkg.releaseChannel,
        _installMethod: DistributionConfig.installMethod,
        _platform: process.platform,
        _arch: process.arch,
        _osRelease: os.release()
      })
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
    setTimeout(() => {
      this.stopAutoreporting()

      // heartbeat
      this[privAutoreportTO].heartbeat = setInterval(() => {
        this.appHeartbeat()
      }, ANALYTICS_HEARTBEAT_INTERVAL)
      this.appOpened()

      // Hashchange
      window.addEventListener('hashchange', this.handleHashChanged, false)

      // Resource
      this[privAutoreportTO].resource = setInterval(() => {
        this.sendResourceUsage()
      }, ANALYTICS_RESOURCE_INTERVAL)

      // Usage
      this[privAutoreportTO].config = setInterval(() => {
        this.sendConfig()
      }, ANALYTICS_CONFIG_INTERVAL)
      this.sendConfig()
    })
  }

  /**
  * Stops auto reporting
  * @return self
  */
  stopAutoreporting () {
    clearInterval(this[privAutoreportTO].heartbeat)
    clearInterval(this[privAutoreportTO].resource)
    clearInterval(this[privAutoreportTO].config)
    window.removeEventListener('hashchange', this.handleHashChanged)
  }

  /**
  * Handles the window hash changing
  * @param evt: the event that fired
  */
  handleHashChanged = (evt) => {
    return this.sendGAEvent('hashchange', {
      ni: 0,
      ec: 'hashchange',
      ea: window.location.hash
    }, true)
  }

  /* ****************************************************************************/
  // Events: WB
  /* ****************************************************************************/

  /**
  * Log the current config
  */
  sendConfig () {
    // Accounts
    const accountState = accountStore.getState()
    const accounts = accountState.allServicesUnordered().map((service) => {
      return {
        type: service.type,
        parentId: service.parentId,
        ...(service.type === SERVICE_TYPES.CONTAINER ? { containerId: service.containerId } : undefined),
        ...(service.type === SERVICE_TYPES.GENERIC && service.url ? { url: new URL(service.url).hostname } : undefined)
      }
    })

    // Settings
    const settingsState = settingsStore.getState()
    const settings = Object.keys(SettingsIdent.SEGMENTS).reduce((acc, id) => {
      const key = SettingsIdent.SEGMENTS[id]
      acc[key] = settingsState[key].cloneData()
      return acc
    }, {})

    // Extensions
    const crexensionState = crextensionStore.getState()
    const extensions = crexensionState.extensionIds()

    // Send
    return this.sendWb('config', {
      accounts: accounts,
      settings: settings,
      extensions: extensions
    }, true)
  }

  /**
  * Log the resource usage
  */
  sendResourceUsage () {
    const metrics = ipcRenderer.sendSync(WB_METRICS_GET_CHROMIUM_METRICS_SYNC)
    if (!metrics) { return Promise.resolve({ sent: false }) }
    const sendMetrics = metrics.map((metric) => {
      if (metric.webContentsInfo) {
        return {
          ...metric,
          webContentsInfo: metric.webContentsInfo.map((wcMetric) => {
            return {
              description: wcMetric.description,
              url: wcMetric.url ? new URL(wcMetric.url).hostname : undefined
            }
          })
        }
      } else {
        return metric
      }
    })

    return this.sendWb('resource', {
      metrics: sendMetrics
    }, true)
  }

  /* ****************************************************************************/
  // Events: GA
  /* ****************************************************************************/

  /**
  * Log the app was opened
  */
  appOpened () {
    return this.sendGAScreenView('opened', undefined, true)
  }

  /**
  * Log the app is alive
  */
  appHeartbeat () {
    return this.sendGAScreenView('heartbeat', undefined, true)
  }

  /* ****************************************************************************/
  // Transmitters: GA
  /* ****************************************************************************/

  /**
  * Sends an analytics report
  * @param reportEventReason: the type of report we're sending
  * @param args={}: the items to append
  * @param autocatch=true: true to automatically swallow errors
  * @return promise
  */
  sendGAScreenView (reportEventReason, args = {}, autocatch = true) {
    return this.sendGA({
      ...this.buildDefaultGAArguments(),
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
  sendGAEvent (reportEventReason, args = {}, autocatch = true) {
    return this.sendGA({
      ...this.buildDefaultGAArguments(),
      cd2: reportEventReason,
      t: 'event',
      ...args
    }, autocatch)
  }

  /**
  * Builds the default configuration
  * @return default configuration
  */
  buildDefaultGAArguments () {
    const userState = userStore.getState()
    const accountState = accountStore.getState()

    return {
      ...this[privLifecycleArgs].ga,
      cid: userState.analyticsId,
      vp: `${window.innerWidth}x${window.innerHeight}`,
      cd1: accountState.serviceCount(),
      cd3: userState.user.plan
    }
  }

  /**
  * Sends the message down the pipe
  * https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
  * https://ga-dev-tools.appspot.com/hit-builder/
  * @param args: the full arguments
  * @param autocatch: true to automatically swallow errors
  * @return promise
  */
  sendGA (args, autocatch) {
    if (!userStore.getState().user.analyticsEnabled) {
      return Promise.resolve({ enabled: false })
    }

    if (!Bootstrap.credentials.GOOGLE_ANALYTICS_ID) {
      const error = new Error('No Anayltics ID specified')
      return autocatch ? Promise.resolve({ sent: false, error: error }) : Promise.reject(error)
    }
    const qs = querystring.stringify(args)
    const gaUrl = 'https://www.google-analytics.com/collect?' + qs
    const wbUrl = 'https://stats.wavebox.io/app/collect?' + qs

    let gaOk = true
    let wbOk = true
    return Promise.resolve()
      .then(() => {
        return Promise.resolve()
          .then(() => window.fetch(gaUrl, { method: 'POST' }))
          .then((res) => {
            gaOk = res.ok
            return Promise.resolve()
          })
      })
      .then(() => {
        return Promise.resolve()
          .then(() => window.fetch(wbUrl, { method: 'POST' }))
          .then((res) => {
            wbOk = res.ok
            return Promise.resolve()
          })
      })
      .then(() => {
        if (!gaOk || !wbOk) {
          if (autocatch) {
            return Promise.resolve({ sent: false })
          } else {
            return Promise.reject(new Error('Collect failed'))
          }
        } else {
          return Promise.resolve()
        }
      })
  }

  /* ****************************************************************************/
  // Transmitters: WB
  /* ****************************************************************************/

  /**
  * Builds the default WB args
  * @return the default configuration
  */
  buildDefaultWBArguments () {
    const userState = userStore.getState()

    return {
      ...this[privLifecycleArgs].wb,
      _analyticsId: userState.analyticsId,
      _plan: userState.user.plan,
      _ga: false
    }
  }

  /**
  * Sends the to wb
  * @param type: the type of report
  * @param args: the full arguments
  * @param autocatch: true to automatically swallow errors
  * @return promise
  */
  sendWb (type, args, autocatch) {
    if (!userStore.getState().user.analyticsEnabled) {
      return Promise.resolve({ enabled: false })
    }

    const endpoint = 'https://stats.wavebox.io/app/collect?ga=false'
    const payload = JSON.stringify({
      ...this.buildDefaultWBArguments(),
      _type: type,
      ...args
    })

    return Promise.resolve()
      .then(() => window.fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      }))
      .then((res) => Promise.resolve({ sent: true }))
      .catch((err) => autocatch ? Promise.resolve({ sent: false }) : Promise.reject(err))
  }
}

export default new Analytics()
