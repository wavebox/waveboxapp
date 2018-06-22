import CoreMailboxActions from './CoreMailboxActions'

class RendererMailboxActions extends CoreMailboxActions {
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
  * Handles the mailbox index being changed remotely
  * @param index: the new index
  */
  remoteSetMailboxIndex (index) {
    return { index }
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Handles the active mailbox being changed remotely
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  remoteSetActive (mailboxId, serviceType) {
    return { mailboxId, serviceType }
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  /**
  * Handles the sleep state of a mailbox chaning
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param isSleeping: true if sleeping, false otherwise
  */
  remoteSetSleep (mailboxId, serviceType, isSleeping) {
    return { mailboxId, serviceType, isSleeping }
  }

  /**
  * Handles a remote sleep metrics set
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param metrics: the metrics to set
  */
  remoteSetSleepMetrics (mailboxId, serviceType, metrics) {
    return { mailboxId, serviceType, metrics }
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

export default RendererMailboxActions
