const SIG = '[TEST:SLACK_DEBUGCOUNT]'
const CHECK_TIME = 1000 * 60 * 2.5

const privRun = Symbol('privRun')

class DebugSlackCount {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privRun] = undefined
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isRunning () { return this[privRun] !== undefined }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  _log (...args) {
    const now = new Date()
    console.log(
      SIG,
      `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      ...args
    )
  }

  /* **************************************************************************/
  // Data Utils
  /* **************************************************************************/

  /**
  * @return a list of all slack services, sorted by id
  */
  _getAllSlackServices () {
    const accountStore = require('stores/account/accountStore').default
    const SERVICE_TYPES = require('shared/Models/ACAccounts/ServiceTypes').default
    const accountState = accountStore.getState()
    return accountState.allServicesOfType(SERVICE_TYPES.SLACK).sort((a, b) => {
      if (a.id < b.id) { return -1 }
      if (a.id > b.id) { return 1 }
      return 0
    })
  }

  /**
  * Removes strings
  * @param obj: the object to remove from
  * @return the same object mutated
  */
  _depthRemoveStrings (obj) {
    if (Array.isArray(obj)) {
      return obj.map((ent) => this._depthRemoveStrings(ent))
    } else if (typeof (obj) === 'object') {
      return Object.keys(obj).reduce((acc, k) => {
        acc[k] = this._depthRemoveStrings(obj[k])
        return acc
      }, {})
    } else if (typeof (obj) === 'string') {
      if (!isNaN(obj)) {
        return obj
      } else {
        return `${obj.substring(0, 2)}|${obj.length}`
      }
    } else {
      return obj
    }
  }

  /**
  * Strips string data from the log data
  * @param originalData: the data to strip from
  * @return a deep copy with strings removed
  */
  _stripLogData (originalData) {
    const clone = JSON.parse(JSON.stringify(originalData))
    return clone.map((entry) => {
      return {
        ...this._depthRemoveStrings(entry),
        type: entry.type,
        subtype: entry.subtype
      }
    })
  }

  /* **************************************************************************/
  // Start
  /* **************************************************************************/

  /**
  * Starts logging
  * @param userIndex=undefined: the index of the slack service to run on
  */
  startLogging (userIndex = undefined) {
    const slackStore = require('stores/slack/slackStore').default
    if (this.isRunning) { throw new Error('Already running. Failed to start') }

    const services = this._getAllSlackServices()
    let service
    if (services.length === 0) {
      throw new Error('No Slack services found. Failed to start')
    } else if (services.length === 1) {
      service = services[0]
    } else if (userIndex === undefined) {
      this._log([
        'Multiple Slack services found. Run `startLogging(index)` with the index of the service you want to use'
      ].concat(services.map((service, index) => {
        return `${index}: ${service.serviceDisplayName}`
      })).join('\n'))
      return
    } else {
      service = services[userIndex]
    }

    if (!service) {
      throw new Error('Slack service not found. Failed to start')
    }

    this._log(`Starting for service ${service.id} ${service.serviceDisplayName}`)
    this[privRun] = {
      serviceId: service.id,
      logger: setInterval(this._handleRecheck, CHECK_TIME),
      log: [],
      prevLog: []
    }

    slackStore.getState().connections.get(service.id).rtm.on('message', this._handleRTMMessage)
  }

  /**
  * Stops logging
  */
  stopLogging () {
    const slackStore = require('stores/slack/slackStore').default
    if (this.isRunning) {
      const serviceId = this[privRun].serviceId
      slackStore.getState().connections.get(serviceId).rtm.removeListener('message', this._handleRTMMessage)
      clearInterval(this[privRun].logger)
      this[privRun] = undefined
      this._log('Stopped')
    }
  }

  /**
  * Writes the current log to disk
  */
  writeLog () {
    if (!this.isRunning) { throw new Error('No session running') }
    const app = require('electron').remote.app
    const fs = require('fs')
    const path = require('path')
    const allLog = [].concat(this[privRun].prevLog, this[privRun].log)
    const strippedLog = this._stripLogData(allLog)

    const allString = allLog.map((ent, ind) => {
      return `${ind}: ${JSON.stringify(ent)}`
    }).join('\n')
    const strippedString = strippedLog.map((ent, ind) => {
      return `${ind}: ${JSON.stringify(ent)}`
    }).join('\n')

    const fullPath = path.join(app.getPath('desktop'), `wavebox_${new Date().getTime()}_full.log`)
    fs.writeFileSync(fullPath, allString)
    this._log(`Log written to ${fullPath}`)

    const strippedPath = path.join(app.getPath('desktop'), `wavebox_${new Date().getTime()}_stripped.log`)
    fs.writeFileSync(strippedPath, strippedString)
    this._log(`Log written to ${strippedPath}`)
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  _handleRTMMessage = (data) => {
    this[privRun].log.push(data)
  }

  /**
  * Checks the current state
  */
  _handleRecheck = () => {
    this._log('Starting check...')
    const accountStore = require('stores/account/accountStore').default
    const SlackHTTP = require('stores/slack/SlackHTTP').default
    const SlackServiceDataReducer = require('shared/AltStores/Account/ServiceDataReducers/SlackServiceDataReducer').default
    const SlackServiceData = require('shared/Models/ACAccounts/Slack/SlackServiceData').default
    const dialog = require('electron').remote.dialog

    const serviceId = this[privRun].serviceId

    // Swap the logs across
    this[privRun].prevLog = this[privRun].log
    this[privRun].log = []

    // See if we can detect a discrepency
    const serviceAuth = accountStore.getState().getMailboxAuthForServiceId(serviceId)
    if (!serviceAuth) { return }

    Promise.resolve()
      .then(() => SlackHTTP.fetchUnreadInfo(serviceAuth.authToken))
      .then((response) => {
        const nextJS = SlackServiceDataReducer.setSlackUnreadInfo(
          undefined,
          accountStore.getState().getServiceData(serviceId),
          response
        )
        const nextSD = new SlackServiceData(nextJS)
        const appSD = accountStore.getState().getServiceData(serviceId)

        if (nextSD.unreadCount !== appSD.unreadCount || nextSD.hasUnreadActivity !== appSD.hasUnreadActivity) {
          this._log([
            'Check match fail',
            `UnreadCount: ${nextSD.unreadCount} ${appSD.unreadCount}`,
            `Activity: ${nextSD.hasUnreadActivity} ${appSD.hasUnreadActivity}`
          ].join('. '))

          dialog.showMessageBox({
            message: 'It looks like the count has fallen out of sync. If this is the case, do you want to write the logs?',
            type: 'question',
            buttons: [ 'Cancel', 'Write' ]
          }, (res) => {
            if (res !== 0) {
              this.writeLog()
            }
          })
        } else {
          this._log([
            'Check match OK',
            `UnreadCount: ${nextSD.unreadCount} ${appSD.unreadCount}`,
            `Activity: ${nextSD.hasUnreadActivity} ${appSD.hasUnreadActivity}`
          ].join('. '))
        }
      })
  }
}

export default DebugSlackCount
