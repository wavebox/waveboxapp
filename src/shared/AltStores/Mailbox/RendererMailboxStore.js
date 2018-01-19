import CoreMailboxStore from './CoreMailboxStore'
import { ACTIONS_NAME } from './AltUserIdentifiers'
import MailboxFactory from '../../Models/Accounts/MailboxFactory'

class RendererMailboxStore extends CoreMailboxStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super()

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleRemoteSetMailbox: actions.REMOTE_SET_MAILBOX,
      handleRemoteSetMailboxIndex: actions.REMOTE_SET_MAILBOX_INDEX,
      handleRemoteSetActive: actions.REMOTE_SET_ACTIVE,
      handleRemoteSetSleep: actions.REMOTE_SET_SLEEP,
      handleRemoteSetSleepMetrics: actions.REMOTE_SET_SLEEP_METRICS,
      handleRemoteSetAvatar: actions.REMOTE_SET_AVATAR
    })
  }

  /* **************************************************************************/
  // Mailbox
  /* **************************************************************************/

  handleRemoteSetMailbox ({id, mailboxJS}) {
    if (mailboxJS) {
      this.mailboxes.set(id, MailboxFactory.modelize(id, mailboxJS))
    } else {
      this.mailboxes.delete(id)
    }
  }

  handleRemoteSetMailboxIndex ({index}) {
    this.index = index
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  remoteSetActive ({mailboxId, serviceType}) {
    this.active = mailboxId
    this.activeService = serviceType
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  handleRemoteSetSleep ({mailboxId, serviceType, isSleeping}) {
    const key = this.getFullServiceKey(mailboxId, serviceType)
    if (isSleeping) {
      this.sleepingServices.add(key)
    } else {
      this.sleepingServices.delete(key)
    }
  }

  handleRemoteSetSleepMetrics ({mailboxId, serviceType, metrics}) {
    this.sleepingMetrics.set(this.getFullServiceKey(mailboxId, serviceType), metrics)
  }

  /* **************************************************************************/
  // Avatar
  /* **************************************************************************/

  remoteSetAvatar (id, b64Image) {
    if (!b64Image) {
      this.avatars.delete(id)
    } else {
      this.avatars.set(id, b64Image)
    }
  }
}

export default RendererMailboxStore
