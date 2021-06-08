import { accountStore } from 'stores/account'
import { slackStore } from 'stores/slack'
import { ServerVent } from 'Server'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import { WB_START_CONNECTION_REPORTER, WB_COLLECT_CONNECTION_METRICS } from 'shared/ipcEvents'
import { ipcRenderer, remote } from 'electron'

export default class ResourceMonitorResponder {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.reporters = new Map()
  }

  /* **************************************************************************/
  // Listening Lifecycle
  /* **************************************************************************/

  listen () {
    ipcRenderer.on(WB_START_CONNECTION_REPORTER, this.startReportingConnectionMetrics)
  }

  unlisten () {
    ipcRenderer.removeListener(WB_START_CONNECTION_REPORTER, this.startReportingConnectionMetrics)
    Array.from(this.reporters.keys()).forEach((senderId) => {
      this.stopReportingConnectionMetrics(senderId)
    })
  }

  /* **************************************************************************/
  // Event responders
  /* **************************************************************************/

  /**
  * Starts reporting connection metrics
  * @param evt: the event that requested
  */
  startReportingConnectionMetrics = (evt, senderId) => {
    this.stopReportingConnectionMetrics(senderId)
    remote.webContents.fromId(senderId).on('destroyed', () => {
      this.stopReportingConnectionMetrics(senderId)
    })

    ipcRenderer.sendTo(senderId, WB_COLLECT_CONNECTION_METRICS, this.buildMetric())
    const interval = setInterval(() => {
      ipcRenderer.sendTo(senderId, WB_COLLECT_CONNECTION_METRICS, this.buildMetric())
    }, 1000)
    this.reporters.set(senderId, interval)
  }

  /**
  * Stops reporting connection metrics
  * @param senderId: the id of the sender
  */
  stopReportingConnectionMetrics = (senderId) => {
    if (this.reporters.has(senderId)) {
      clearInterval(this.reporters.get(senderId))
      this.reporters.delete(senderId)
    }
  }

  /**
  * Builds the metric to send
  * @return metric info
  */
  buildMetric = () => {
    const accountState = accountStore.getState()
    return {
      pid: process.pid,
      connections: [
        {
          description: 'Wavebox Sync',
          isSetup: ServerVent.isSocketSetup,
          isUnderMaintenance: ServerVent.isSocketUnderMaintenance,
          isConnected: ServerVent.isSocketConnected,
          connectionMode: ServerVent.isSocketUsingLongPoll ? 'LongPoll' : ServerVent.isSocketUsingWebSocket ? 'WebSocket' : 'Unknown'
        }
      ].concat(
        accountState
          .allServicesOfType(SERVICE_TYPES.SLACK)
          .map((service) => {
            const slackState = slackStore.getState()
            const displayName = accountState.resolvedServiceDisplayName(service.id)
            return {
              description: `Slack : ${displayName}`,
              isSetup: slackState.isServiceConnectionSetup(service.id),
              isUnderMaintenance: false,
              isConnected: slackState.isServiceConnected(service.id),
              connectionMode: 'WebSocket'
            }
          })
      )
    }
  }
}
