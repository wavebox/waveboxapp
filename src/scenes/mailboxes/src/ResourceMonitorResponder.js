import {mailboxStore} from 'stores/mailbox'
import {slackStore} from 'stores/slack'
import MailboxTypes from 'shared/Models/Accounts/MailboxTypes'
import {ServerVent} from 'Server'
import {
  WB_PING_RESOURCE_USAGE,
  WB_PONG_RESOURCE_USAGE
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

export default class ResourceMonitorResponder {
  /* **************************************************************************/
  // Listening Lifecycle
  /* **************************************************************************/

  listen () {
    ipcRenderer.on(WB_PING_RESOURCE_USAGE, this.handlePingResourceUsage)
  }

  unlisten () {
    ipcRenderer.removeListener(WB_PING_RESOURCE_USAGE, this.handlePingResourceUsage)
  }

  /* **************************************************************************/
  // Event responders
  /* **************************************************************************/

  handlePingResourceUsage = () => {
    ipcRenderer.send(WB_PONG_RESOURCE_USAGE, {
      ...process.getCPUUsage(),
      ...process.getProcessMemoryInfo(),
      pid: process.pid,
      description: `Mailboxes Window`,
      connections: [
        {
          description: 'Wavebox Sync',
          isSetup: ServerVent.isSocketSetup,
          isUnderMaintenance: ServerVent.isSocketUnderMaintenance,
          isConnected: ServerVent.isSocketConnected,
          connectionMode: ServerVent.isSocketUsingLongPoll ? 'LongPoll' : ServerVent.isSocketUsingWebSocket ? 'WebSocket' : 'Unknown'
        }
      ].concat(
        mailboxStore
        .getState()
        .getMailboxesOfType(MailboxTypes.SLACK)
        .map((mailbox) => {
          const slackState = slackStore.getState()
          return {
            description: `Slack : ${mailbox.displayName}`,
            isSetup: slackState.isMailboxConnectionSetup(mailbox.id),
            isUnderMaintenance: false,
            isConnected: slackState.isMailboxConnected(mailbox.id),
            connectionMode: 'WebSocket'
          }
        })
      )
    })
  }
}
