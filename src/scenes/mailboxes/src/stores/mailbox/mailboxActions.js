import alt from '../alt'
import mailboxDispatch from './mailboxDispatch'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import ServiceReducer from './ServiceReducer'
import { GoogleMailbox, GoogleDefaultService } from 'shared/Models/Accounts/Google'
import { SlackMailbox } from 'shared/Models/Accounts/Slack'
import { TrelloMailbox } from 'shared/Models/Accounts/Trello'
import { MicrosoftMailbox } from 'shared/Models/Accounts/Microsoft'
import { GenericMailbox } from 'shared/Models/Accounts/Generic'
import { ContainerMailbox } from 'shared/Models/Accounts/Container'
import MailboxTypes from 'shared/Models/Accounts/MailboxTypes'
import {
  WB_AUTH_GOOGLE_COMPLETE,
  WB_AUTH_GOOGLE_ERROR,
  WB_AUTH_MICROSOFT_COMPLETE,
  WB_AUTH_MICROSOFT_ERROR,
  WB_AUTH_SLACK_COMPLETE,
  WB_AUTH_SLACK_ERROR,
  WB_AUTH_TRELLO_COMPLETE,
  WB_AUTH_TRELLO_ERROR,

  WB_WINDOW_FIND_START,
  WB_WINDOW_FIND_NEXT,
  WB_WINDOW_ZOOM_IN,
  WB_WINDOW_ZOOM_OUT,
  WB_WINDOW_ZOOM_RESET,
  WB_WINDOW_RELOAD_WEBVIEW,
  WB_WINDOW_OPEN_DEV_TOOLS_WEBVIEW,
  WB_WINDOW_FOCUS,

  WB_MAILBOXES_WINDOW_SWITCH_MAILBOX,
  WB_MAILBOXES_WINDOW_SWITCH_SERVICE,

  WB_GUEST_API_SAFE_REDUCE
} from 'shared/ipcEvents'
import { ipcRenderer, remote } from 'electron'

const { session } = remote

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
  remoteChange () { return {} }

  /**
  * Sets the tab id for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param tabId: the id of the tab to set
  */
  setWebcontentTabId (mailboxId, serviceType, tabId) {
    return { mailboxId, serviceType, tabId }
  }

  /**
  * Deletes the tab id for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  deleteWebcontentTabId (mailboxId, serviceType) {
    return { mailboxId, serviceType }
  }

  /* **************************************************************************/
  // Mailbox Wizards
  /* **************************************************************************/

  /**
  * Starts adding a new mailbox
  * @param type: the mailbox type
  * @param accessMode=undefined: the acessMode if applicable
  */
  startAddMailbox (type, accessMode) {
    if (type === MailboxTypes.GOOGLE) {
      if (accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
        return this.startAddGmailWizard()
      } else if (accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
        return this.startAddGinboxWizard()
      }
    } else if (type === MailboxTypes.MICROSOFT) {
      if (accessMode === MicrosoftMailbox.ACCESS_MODES.OUTLOOK) {
        return this.startAddOutlookWizard()
      } else if (accessMode === MicrosoftMailbox.ACCESS_MODES.OFFICE365) {
        return this.startAddOffice365Wizard()
      }
    } else if (type === MailboxTypes.TRELLO) {
      return this.startAddTrelloWizard()
    } else if (type === MailboxTypes.SLACK) {
      return this.startAddSlackWizard()
    } else if (type === MailboxTypes.GENERIC) {
      return this.startAddGenericWizard()
    } else if (type === MailboxTypes.CONTAINER) {
      return this.startAddContainerWizard(accessMode)
    }
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddGinboxWizard () {
    window.location.hash = `/mailbox_wizard/${GoogleMailbox.type}/${GoogleDefaultService.ACCESS_MODES.GINBOX}/0`
    return {}
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddGmailWizard () {
    window.location.hash = `/mailbox_wizard/${GoogleMailbox.type}/${GoogleDefaultService.ACCESS_MODES.GMAIL}/0`
    return {}
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddSlackWizard () {
    window.location.hash = `/mailbox_wizard/${SlackMailbox.type}/_/0`
    return {}
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddTrelloWizard () {
    window.location.hash = `/mailbox_wizard/${TrelloMailbox.type}/_/0`
    return {}
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddOutlookWizard () {
    window.location.hash = `/mailbox_wizard/${MicrosoftMailbox.type}/${MicrosoftMailbox.ACCESS_MODES.OUTLOOK}/0`
    return {}
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddOffice365Wizard () {
    window.location.hash = `/mailbox_wizard/${MicrosoftMailbox.type}/${MicrosoftMailbox.ACCESS_MODES.OFFICE365}/0`
    return {}
  }

  /**
  * Starts the add mailbox wizard
  */
  startAddGenericWizard () {
    window.location.hash = `/mailbox_wizard/${GenericMailbox.type}/_/0`
    return {}
  }

  /**
  * Starts the add container wizard
  * @param containerId: the id of the container
  */
  startAddContainerWizard (containerId) {
    window.location.hash = `/mailbox_wizard/${ContainerMailbox.type}/${containerId}/0`
    return {}
  }

  /* **************************************************************************/
  // Mailbox Auth
  /* **************************************************************************/

  /**
  * Authenticates a new mailbox
  * @param MailboxClass: the mailbox class
  * @param accessMode=undefined: the acessMode if applicable
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateMailbox (MailboxClass, accessMode = undefined, provisionalJS = undefined) {
    if (MailboxClass.type === MailboxTypes.GOOGLE) {
      if (accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
        return this.authenticateGmailMailbox(provisionalJS)
      } else if (accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
        return this.authenticateGinboxMailbox(provisionalJS)
      }
    } else if (MailboxClass.type === MailboxTypes.MICROSOFT) {
      if (accessMode === MicrosoftMailbox.ACCESS_MODES.OUTLOOK) {
        return this.authenticateOutlookMailbox(provisionalJS)
      } else if (accessMode === MicrosoftMailbox.ACCESS_MODES.OFFICE365) {
        return this.authenticateOffice365Mailbox(provisionalJS)
      }
    } else if (MailboxClass.type === MailboxTypes.TRELLO) {
      return this.authenticateTrelloMailbox(provisionalJS)
    } else if (MailboxClass.type === MailboxTypes.SLACK) {
      return this.authenticateSlackMailbox(provisionalJS)
    } else if (MailboxClass.type === MailboxTypes.GENERIC) {
      return this.authenticateGenericMailbox(provisionalJS)
    } else if (MailboxClass.type === MailboxTypes.CONTAINER) {
      return this.authenticateContainerMailbox(accessMode, provisionalJS)
    }
  }

  /**
  * Starts the auth process for google inbox
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateGinboxMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = GoogleMailbox.sanitizeProvisionalJS(provisionalJS, GoogleDefaultService.ACCESS_MODES.GINBOX)
    } else {
      provisionalJS = GoogleMailbox.createJS(CoreMailbox.provisionId(), GoogleDefaultService.ACCESS_MODES.GINBOX)
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }

  /**
  * Starts the auth process for gmail
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateGmailMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = GoogleMailbox.sanitizeProvisionalJS(provisionalJS, GoogleDefaultService.ACCESS_MODES.GMAIL)
    } else {
      provisionalJS = GoogleMailbox.createJS(CoreMailbox.provisionId(), GoogleDefaultService.ACCESS_MODES.GMAIL)
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }

  /**
  * Starts the auth process for slack
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateSlackMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = SlackMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = SlackMailbox.createJS(CoreMailbox.provisionId())
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }

  /**
  * Starts the auth process for trello
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateTrelloMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = TrelloMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = TrelloMailbox.createJS(CoreMailbox.provisionId())
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }

  /**
  * Starts the auth process for outlook
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  * @param additionalPermissions=[]: additional permissions to request
  */
  authenticateOutlookMailbox (provisionalJS = undefined, additionalPermissions = []) {
    if (provisionalJS) {
      provisionalJS = MicrosoftMailbox.sanitizeProvisionalJS(provisionalJS, MicrosoftMailbox.ACCESS_MODES.OUTLOOK)
    } else {
      provisionalJS = MicrosoftMailbox.createJS(CoreMailbox.provisionId(), MicrosoftMailbox.ACCESS_MODES.OUTLOOK)
    }
    return {
      provisionalJS: provisionalJS,
      provisionalId: provisionalJS.id,
      additionalPermissions: additionalPermissions
    }
  }

  /**
  * Starts the auth process for office 365
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  * @param additionalPermissions=[]: additional permissions to request
  */
  authenticateOffice365Mailbox (provisionalJS = undefined, additionalPermissions = []) {
    if (provisionalJS) {
      provisionalJS = MicrosoftMailbox.sanitizeProvisionalJS(provisionalJS, MicrosoftMailbox.ACCESS_MODES.OFFICE365)
    } else {
      provisionalJS = MicrosoftMailbox.createJS(CoreMailbox.provisionId(), MicrosoftMailbox.ACCESS_MODES.OFFICE365)
    }
    return {
      provisionalJS: provisionalJS,
      provisionalId: provisionalJS.id,
      additionalPermissions: additionalPermissions
    }
  }

  /**
  * Starts the auth process for generic mailbox
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateGenericMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = GenericMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = GenericMailbox.createJS(CoreMailbox.provisionId())
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }

  /**
  * Starts the auth process for generic mailbox
  * @param containerId: the id of the container to use
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  authenticateContainerMailbox (containerId, provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = ContainerMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = ContainerMailbox.createJS(CoreMailbox.provisionId())
    }
    return { containerId: containerId, provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  /**
  * Reauthenticates a mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  reauthenticateMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a google mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  reauthenticateGoogleMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a microsoft mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  reauthenticateMicrosoftMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a slack mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  reauthenticateSlackMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a trello mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  reauthenticateTrelloMailbox (mailboxId) { return { mailboxId: mailboxId } }

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
  // Mailbox auth teardown
  /* **************************************************************************/

  /**
  * Clears the browser session for a mailbox
  * @param mailboxId: the id of the mailbox to clear
  */
  clearMailboxBrowserSession (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Clears all the browser sessions
  */
  clearAllBrowserSessions () { return {} }

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
  * Changes the index of a mailbox
  */
  changeIndex (id, nextIndex) { return { id, nextIndex } }

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

  /**
  * Updates and modifies a mailbox service only if it's active
  * @param id: the id of the mailbox to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceIfActive (id, serviceType, reducer, ...reducerArgs) {
    return { id: id, serviceType: serviceType, reducer: reducer, reducerArgs: reducerArgs }
  }

  /**
  * Updates and modifies a mailbox service only if it's inactive
  * @param id: the id of the mailbox to change
  * @param serviceType: the type of service to work on
  * @param reducer: the reducer to run on the mailbox
  * @param ...reducerArgs: the arguments to supply to the reducer
  */
  reduceServiceIfInactive (id, serviceType, reducer, ...reducerArgs) {
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
  // Sleeping
  /* **************************************************************************/

  /**
  * Sleeps a service
  * @param id: the id of the mailbox
  * @param service: the service to awaken
  */
  sleepService (id, service) {
    return { id: id, service: service }
  }

  /**
  * Wakes up a service from sleep
  * @param id: the id of the mailbox
  * @param service: the service to awaken
  */
  awakenService (id, service) {
    return { id: id, service: service }
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
  * Changes the active mailbox to the previous in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveToPrev (allowCycling = false) {
    return { allowCycling: allowCycling }
  }

  /**
  * Changes the active mailbox to the next in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveToNext (allowCycling = false) {
    return { allowCycling: allowCycling }
  }

  /**
  * Changes the active service to the one at the supplied index. If there
  * is no service this will just fail silently
  */
  changeActiveServiceIndex (index) {
    return { index: index }
  }

  /**
  * Changes the active service to the previous in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveServiceToPrev (allowCycling = false) {
    return { allowCycling: allowCycling }
  }

  /**
  * Changes the active service to the next in the list
  * @param allowCycling=false: set to true to allow cycling at end/beginning
  */
  changeActiveServiceToNext (allowCycling = false) {
    return { allowCycling: allowCycling }
  }

  /* **************************************************************************/
  // Search
  /* **************************************************************************/

  /**
  * Starts searching the mailbox
  * @param id=optional: the mailbox id
  * @param service=optional: the type of service to search for
  */
  startSearchingMailbox (id, service) {
    return { id: id, service: service }
  }

  /**
  * Stops searching the mailbox but in a way that simply stops tracking the search process
  * Best to use this if search is not handled by us to unmount the track
  */
  untrackSearchingMailbox (id, service) {
    return { id: id, service: service }
  }

  /**
  * Stops searching the mailbox
  * @param id=optional: the mailbox id
  * @param service=optional: the type of service to stop search for
  */
  stopSearchingMailbox (id, service) {
    return { id: id, service: service }
  }

  /**
  * Sets the search term
  * @param id=optional: the mailbox id
  * @param service=optional: the type of service to search for
  * @param str: the search string
  */
  setSearchTerm (id, service, str) {
    return { id: id, service: service, str: str }
  }

  /**
  * Searches for the next occurance of the search term
  * @param id=optional: the mailbox id
  * @param service=optional: the type of service to search for
  */
  searchNextTerm (id, service) {
    return { id: id, service: service }
  }

  /* **************************************************************************/
  // Guest
  /* **************************************************************************/

  /**
  * Sets the title of the guest page
  * @param id: the mailbox id of the guest
  * @param service: the type of service of the guest
  * @param title: the new title
  */
  setGuestTitle (id, service, title) {
    return { id: id, service: service, title: title }
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

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  /**
  * Indicates the ids of the given containers have been updated
  * @param containers: a key-value object map of the updated containers
  */
  containersUpdated (containers) { return { containers } }

  /* **************************************************************************/
  // Misc
  /* **************************************************************************/

  /**
  * Reloads the active mailbox
  */
  reloadActiveMailbox () { return {} }

  /**
  * Opens the dev tools on the active mailbox
  */
  openDevToolsActiveMailbox () { return {} }

  /**
  * Indicates the main window focused
  */
  windowDidFocus () { return {} }
}

const actions = alt.createActions(MailboxActions)

// Auth
ipcRenderer.on(WB_AUTH_GOOGLE_COMPLETE, actions.authGoogleMailboxSuccess)
ipcRenderer.on(WB_AUTH_GOOGLE_ERROR, actions.authGoogleMailboxFailure)
ipcRenderer.on(WB_AUTH_SLACK_COMPLETE, actions.authSlackMailboxSuccess)
ipcRenderer.on(WB_AUTH_SLACK_ERROR, actions.authSlackMailboxFailure)
ipcRenderer.on(WB_AUTH_TRELLO_COMPLETE, actions.authTrelloMailboxSuccess)
ipcRenderer.on(WB_AUTH_TRELLO_ERROR, actions.authTrelloMailboxFailure)
ipcRenderer.on(WB_AUTH_MICROSOFT_COMPLETE, actions.authMicrosoftMailboxSuccess)
ipcRenderer.on(WB_AUTH_MICROSOFT_ERROR, actions.authMicrosoftMailboxFailure)

// Mailbox modifiers
ipcRenderer.on(WB_WINDOW_ZOOM_IN, () => actions.reduceService(undefined, undefined, ServiceReducer.increaseZoom))
ipcRenderer.on(WB_WINDOW_ZOOM_OUT, () => actions.reduceService(undefined, undefined, ServiceReducer.decreaseZoom))
ipcRenderer.on(WB_WINDOW_ZOOM_RESET, () => actions.reduceService(undefined, undefined, ServiceReducer.resetZoom))
ipcRenderer.on(WB_WINDOW_FIND_START, () => actions.startSearchingMailbox())
ipcRenderer.on(WB_WINDOW_FIND_NEXT, () => actions.searchNextTerm())

// Switching
ipcRenderer.on(WB_MAILBOXES_WINDOW_SWITCH_MAILBOX, (evt, req) => {
  if (req.mailboxId) {
    actions.changeActive(req.mailboxId, req.serviceType)
  } else if (req.prev) {
    actions.changeActiveToPrev(req.allowCycling)
  } else if (req.next) {
    actions.changeActiveToNext(req.allowCycling)
  }
})
ipcRenderer.on(WB_MAILBOXES_WINDOW_SWITCH_SERVICE, (evt, req) => {
  if (req.index) {
    actions.changeActiveServiceIndex(req.index)
  } else if (req.prev) {
    actions.changeActiveServiceToPrev(req.allowCycling)
  } else if (req.next) {
    actions.changeActiveServiceToNext(req.allowCycling)
  }
})

// Misc
ipcRenderer.on(WB_WINDOW_RELOAD_WEBVIEW, actions.reloadActiveMailbox)
ipcRenderer.on(WB_WINDOW_OPEN_DEV_TOOLS_WEBVIEW, actions.openDevToolsActiveMailbox)
ipcRenderer.on(WB_WINDOW_FOCUS, actions.windowDidFocus)

ipcRenderer.on(WB_GUEST_API_SAFE_REDUCE, (evt, mailboxId, serviceType, name, reducerConfig) => {
  switch (name) {
    case 'badge:setCount':
      actions.reduceService(mailboxId, serviceType, ServiceReducer.setAdaptorUnreadCount, ...reducerConfig)
      break
    case 'badge:setHasUnreadActivity':
      actions.reduceService(mailboxId, serviceType, ServiceReducer.setAdaptorHasUnreadActivity, ...reducerConfig)
      break
    case 'tray:setMessages':
      actions.reduceService(mailboxId, serviceType, ServiceReducer.setAdaptorTrayMessages, ...reducerConfig)
      break
  }
})

export default actions
