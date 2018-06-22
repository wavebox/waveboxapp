import CoreAccountActions from './CoreAccountActions'

class RendererAccountActions extends CoreAccountActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * @overwrite
  */
  load () {
    return this.remoteConnect()
  }

  /* **************************************************************************/
  // Mailbox
  /* **************************************************************************/

  /**
  * Handles a mailbox being changed remotely
  * @param id: the mailbox id
  * @param mailboxJS: the json of the mailbox
  */
  remoteSetMailbox (id, mailboxJS) {
    return { id, mailboxJS }
  }

  /**
  * Handles a mailbox auth being set
  * * @param id: the mailbox id
  * @param mailboxJS: the json of the auth
  */
  remoteSetMailboxAuth (id, mailboxAuthJS) {
    return { id, mailboxAuthJS }
  }

  /**
  * Handles the mailbox index being changed remotely
  * @param index: the new index
  */
  remoteSetMailboxIndex (index) {
    return { index }
  }

  /* **************************************************************************/
  // Service
  /* **************************************************************************/

  /**
  * Handles a service being changed remotely
  * @param id: the service id
  * @param serviceJS: the json of the service
  */
  remoteSetService (id, serviceJS) {
    return { id, serviceJS }
  }

  /**
  * Handles a service data being changed remotely
  * @param id: the service id
  * @param serviceDataJS: the json of the service
  */
  remoteSetServiceData (id, serviceDataJS) {
    return { id, serviceDataJS }
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Handles the active mailbox being changed remotely
  * @param serviceId: the id of the service
  */
  remoteSetActiveService (serviceId) {
    return { serviceId }
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  /**
  * Handles the sleep state of a mailbox chaning
  * @param serviceId: the id of the service
  * @param isSleeping: true if sleeping, false otherwise
  */
  remoteSetSleep (serviceId, isSleeping) {
    return { serviceId, isSleeping }
  }

  /**
  * Handles a remote sleep metrics set
  * @param serviceId: the id of the service
  * @param metrics: the metrics to set
  */
  remoteSetSleepMetrics (serviceId, metrics) {
    return { serviceId, metrics }
  }

  /* **************************************************************************/
  // Avatar
  /* **************************************************************************/

  /**
  * Remotely sets an avatar
  * @param id: the id of the avatar
  * @param b64Image: the image to set
  */
  remoteSetAvatar (id, b64Image) {
    return {id, b64Image}
  }
}

export default RendererAccountActions
