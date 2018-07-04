import CoreAccountStore from './CoreAccountStore'
import { ACTIONS_NAME } from './AltAccountIdentifiers'
import ACMailbox from '../../Models/ACAccounts/ACMailbox'
import ServiceFactory from '../../Models/ACAccounts/ServiceFactory'
import AuthFactory from '../../Models/ACAccounts/AuthFactory'

class RendererAccountStore extends CoreAccountStore {
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
      handleRemoteSetMailboxAuth: actions.REMOTE_SET_MAILBOX_AUTH,
      handleRemoteSetMailboxIndex: actions.REMOTE_SET_MAILBOX_INDEX,
      handleRemoteSetService: actions.REMOTE_SET_SERVICE,
      handleRemoteSetServiceData: actions.REMOTE_SET_SERVICE_DATA,
      handleRemoteSetActiveService: actions.REMOTE_SET_ACTIVE_SERVICE,
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
      this._mailboxes_.set(id, new ACMailbox(mailboxJS))
    } else {
      this._mailboxes_.delete(id)
    }
  }

  handleRemoteSetMailboxAuth ({ id, mailboxAuthJS }) {
    if (mailboxAuthJS) {
      this._mailboxAuth_.set(id, AuthFactory.modelizeAuth(mailboxAuthJS))
    } else {
      this._mailboxAuth_.delete(id)
    }
  }

  handleRemoteSetMailboxIndex ({index}) {
    this._mailboxIndex_ = index
  }

  /* **************************************************************************/
  // Services
  /* **************************************************************************/

  handleRemoteSetService ({id, serviceJS}) {
    if (serviceJS) {
      this._services_.set(id, ServiceFactory.modelizeService(serviceJS))
    } else {
      this._services_.delete(id)
    }
  }

  handleRemoteSetServiceData ({ id, serviceDataJS }) {
    if (serviceDataJS) {
      this._serviceData_.set(id, ServiceFactory.modelizeServiceData(serviceDataJS))
    } else {
      this._serviceData_.delete(id)
    }
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  handleRemoteSetActiveService ({serviceId}) {
    this._activeServiceId_ = serviceId
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  handleRemoteSetSleep ({serviceId, isSleeping}) {
    this._sleepingServices_.set(serviceId, isSleeping)
  }

  handleRemoteSetSleepMetrics ({serviceId, metrics}) {
    this._sleepingMetrics_.set(serviceId, metrics)
  }

  /* **************************************************************************/
  // Avatar
  /* **************************************************************************/

  handleRemoteSetAvatar ({id, b64Image}) {
    if (!b64Image) {
      this._avatars_.delete(id)
    } else {
      this._avatars_.set(id, b64Image)
    }
  }
}

export default RendererAccountStore
