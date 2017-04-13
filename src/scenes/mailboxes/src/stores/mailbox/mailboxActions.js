const alt = require('../alt')
const { ipcRenderer, remote } = window.nativeRequire('electron')
const { session } = remote
const mailboxDispatch = require('./mailboxDispatch')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const ServiceReducer = require('./ServiceReducer')

class MailboxActions {
  /* **************************************************************************/
  // Store Lifecyle
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

  /**
  * Handles a remote change by mirroring the changes in our own store
  */
  remoteChange () {
    return {}
  }

  /* **************************************************************************/
  // Mailbox Auth
  /* **************************************************************************/

  /**
  * Starts the auth process for google inbox
  */
  authenticateGinboxMailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /**
  * Starts the auth process for gmail
  */
  authenticateGmailMailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /**
  * Starts the auth process for slack
  */
  authenticateSlackMailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /**
  * Starts the auth process for trello
  */
  authenticateTrelloMailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /**
  * Starts the auth process for outlook
  */
  authenticateOutlookMailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /**
  * Starts the auth process for office 365
  */
  authenticateOffice365Mailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /**
  * Starts the auth process for generic mailbox
  */
  authenticateGenericMailbox () { return { provisionalId: CoreMailbox.provisionId() } }

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  /**
  * Reauthenticates a mailbox
  */
  reauthenticateMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a google mailbox
  */
  reauthenticateGoogleMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /* **************************************************************************/
  // Mailbox Auth callbacks
  /* **************************************************************************/

  /**
  * Handles a Google mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authGoogleMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      temporaryCode: data.temporaryCode,
      pushToken: data.pushToken,
      authMode: data.authMode,
      codeRedirectUri: data.codeRedirectUri
    }
  }

  /**
  * Handles a mailbox authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  authGoogleMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /**
  * Handles a slack mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authSlackMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      teamUrl: data.teamUrl,
      token: data.token,
      authMode: data.authMode
    }
  }

  /**
  * Handles a slack mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authSlackMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /**
  * Handles a Trello mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authTrelloMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      authToken: data.token,
      authAppKey: data.appKey,
      authMode: data.authMode
    }
  }

  /**
  * Handles a Trello mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authTrelloMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /**
  * Handles a Microsoft mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authMicrosoftMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      temporaryCode: data.temporaryCode,
      authMode: data.authMode,
      codeRedirectUri: data.codeRedirectUri
    }
  }

  /**
  * Handles a Microsoft mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authMicrosoftMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /* **************************************************************************/
  // Mailbox connection lifecycle
  /* **************************************************************************/

  /**
  * Connects all mailboxes from the sync services
  */
  connectAllMailboxes () {
    return {}
  }

  /**
  * Connects a mailbox to the sync service
  * @param mailboxId: the id of the mailbox
  */
  connectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Disconnects all mailboxes from the sync services
  */
  disconnectAllMailboxes () {
    return {}
  }

  /**
  * Disconnects a mailbox from the sync service
  * @param mailboxId: the id of the mailbox
  */
  disconnectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Mailboxes
  /* **************************************************************************/

  /**
  * Creates a new mailbox
  * @param id: the id of the mailbox
  * @param data: the data to create it with
  */
  create (id, data) { return { id: id, data: data } }

  /**
  * Removes a mailbox
  * @param id: the id of the mailbox to update
  */
  remove (id) { return { id: id } }

  /**
  * Moves a mailbox up in the index
  * @param id: the id of the mailbox
  */
  moveUp (id) { return { id: id } }

  /**
  * Moves a mailbox down in the index
  * @param id: the id of the mailbox
  */
  moveDown (id) { return { id: id } }

  /**
  * Updates and modifies a mailbox
  * @param id: the id of the mailbox to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduce (id, reducer, ...reducerArgs) {
    return { id: id, reducer: reducer, reducerArgs: reducerArgs }
  }

  /**
  * Sets a custom avatar
  * @param id: the id of the mailbox
  * @param b64Image: the image to set
  */
  setCustomAvatar (id, b64Image) { return { id: id, b64Image: b64Image } }

  /**
  * Sets a service avatar locally for services that don't support grabbing it off the web
  * @param id: the id of the mailbox
  * @param b64Image: the image to set
  */
  setServiceLocalAvatar (id, b64Image) { return { id: id, b64Image: b64Image } }

  /* **************************************************************************/
  // Services
  /* **************************************************************************/

  /**
  * Updates and modifies a mailbox service
  * @param id: the id of the mailbox to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceService (id, serviceType, reducer, ...reducerArgs) {
    return { id: id, serviceType: serviceType, reducer: reducer, reducerArgs: reducerArgs }
  }

  /* **************************************************************************/
  // Avatar
  /* **************************************************************************/

  /**
  * Updates and modifies a mailbox avatar
  * @param id: the id of the mailbox to change
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceAvatar (id, reducer, ...reducerArgs) {
    return { id: id, reducer: reducer, reducerArgs: reducerArgs }
  }

  /* **************************************************************************/
  // Snapshots
  /* **************************************************************************/

  /**
  * Sets a snapshot of a service
  * @param id: the id of the mailbox
  * @param service: the service type
  * @param snapshot: the snapshot as a base64 string
  */
  setServiceSnapshot (id, service, snapshot) {
    return { id: id, service: service, snapshot: snapshot }
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Changes the active mailbox
  * @param id: the id of the mailbox
  * @param service=default: the service to change to
  */
  changeActive (id, service = CoreMailbox.SERVICE_TYPES.DEFAULT) {
    return { id: id, service: service }
  }

  /**
  * Changes the active service to the one at the supplied index. If there
  * is no service this will just fail silently
  */
  changeActiveServiceIndex (index) {
    return { index: index }
  }

  /**
  * Changes the active mailbox to the previous in the list
  */
  changeActiveToPrev () { return {} }

  /**
  * Changes the active mailbox to the next in the list
  */
  changeActiveToNext () { return {} }

  /* **************************************************************************/
  // Search
  /* **************************************************************************/

  /**
  * Starts searching the mailbox
  * @param id: the mailbox id
  * @param service: the type of service to search for
  */
  startSearchingMailbox (id, service) {
    return { id: id, service: service }
  }

  /**
  * Stops searching the mailbox
  * @param id: the mailbox id
  * @param service: the type of service to stop search for
  */
  stopSearchingMailbox (id, service) {
    return { id: id, service: service }
  }

  /* **************************************************************************/
  // Sync
  /* **************************************************************************/

  /**
  * Triggers a full sync on a mailbox
  * @param id: the id of the mailbox
  */
  fullSyncMailbox (id) {
    return { id: id }
  }

  /* **************************************************************************/
  // Auth Tools
  /* **************************************************************************/

  /**
  * Reauthenticates the user by logging them out of the webview
  * @param id: the id of the mailbox
  * @param partition: the partition of the mailbox
  */
  reauthenticateBrowserSession (id, partition) {
    const ses = session.fromPartition('persist:' + partition)
    const promise = Promise.resolve()
      .then(() => {
        return new Promise((resolve) => {
          ses.clearStorageData(resolve)
        })
      })
      .then(() => {
        return new Promise((resolve) => {
          ses.clearCache(resolve)
        })
      })
      .then(() => {
        mailboxDispatch.reloadAllServices(id)
        return Promise.resolve()
      })

    return { promise: promise }
  }
}

const actions = alt.createActions(MailboxActions)

// Auth
ipcRenderer.on('auth-google-complete', actions.authGoogleMailboxSuccess)
ipcRenderer.on('auth-google-error', actions.authGoogleMailboxFailure)
ipcRenderer.on('auth-slack-complete', actions.authSlackMailboxSuccess)
ipcRenderer.on('auth-slack-error', actions.authSlackMailboxFailure)
ipcRenderer.on('auth-trello-complete', actions.authTrelloMailboxSuccess)
ipcRenderer.on('auth-trello-error', actions.authTrelloMailboxFailure)
ipcRenderer.on('auth-microsoft-complete', actions.authMicrosoftMailboxSuccess)
ipcRenderer.on('auth-microsoft-error', actions.authMicrosoftMailboxFailure)

// Mailbox modifiers
ipcRenderer.on('mailbox-zoom-in', () => actions.reduceService(undefined, undefined, ServiceReducer.increaseZoom))
ipcRenderer.on('mailbox-zoom-out', () => actions.reduceService(undefined, undefined, ServiceReducer.decreaseZoom))
ipcRenderer.on('mailbox-zoom-reset', () => actions.reduceService(undefined, undefined, ServiceReducer.resetZoom))
ipcRenderer.on('find-start', () => actions.startSearchingMailbox())

// Switching
ipcRenderer.on('switch-mailbox', (evt, req) => {
  if (req.mailboxId) {
    actions.changeActive(req.mailboxId, req.serviceType)
  } else if (req.prev) {
    actions.changeActiveToPrev()
  } else if (req.next) {
    actions.changeActiveToNext()
  }
})
ipcRenderer.on('switch-service-index', (evt, req) => actions.changeActiveServiceIndex(req.index))

module.exports = actions
