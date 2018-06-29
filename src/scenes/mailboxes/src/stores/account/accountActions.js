import RendererAccountActions from 'shared/AltStores/Account/RendererAccountActions'
import alt from '../alt'
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
  WB_WINDOW_FIND_NEXT
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { ACCOUNT_TEMPLATE_TYPES } from 'shared/Models/ACAccounts/AccountTemplates'

class AccountActions extends RendererAccountActions {
  /* **************************************************************************/
  // Tab ids
  /* **************************************************************************/

  /**
  * Sets the tab id for a service
  * @param serviceId: the id of the service
  * @param serviceType: the type of service
  * @param tabId: the id of the tab to set
  */
  setWebcontentTabId (serviceId, tabId) {
    return { serviceId, tabId }
  }

  /**
  * Deletes the tab id for a service
  * @param serviceId: the id of the service
  */
  deleteWebcontentTabId (serviceId) {
    return { serviceId }
  }

  /* **************************************************************************/
  // Mailbox Creation
  /* **************************************************************************/

  /**
  * Starts adding a mailbox
  * @param templateType: the type of template to add
  * @param accessMode='_': the access mode to pass to the add wizard
  */
  startAddMailboxGroup (templateType, accessMode) {
    accessMode = accessMode || '_' // this sometimes comes in as empty string
    if (ACCOUNT_TEMPLATE_TYPES[templateType]) {
      window.location.hash = `/mailbox_wizard/${templateType}/${accessMode}/0`
      return {}
    }

    // We also have some classic mappings to work with
    if (templateType === 'GOOGLE') {
      if (accessMode === 'GMAIL') {
        window.location.hash = `/mailbox_wizard/${ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL}/_/0`
        return {}
      } else if (accessMode === 'GINBOX') {
        window.location.hash = `/mailbox_wizard/${ACCOUNT_TEMPLATE_TYPES.GOOGLE_INBOX}/_/0`
        return {}
      }
    } else if (templateType === 'MICROSOFT') {
      if (accessMode === 'OUTLOOK') {
        window.location.hash = `/mailbox_wizard/${ACCOUNT_TEMPLATE_TYPES.OUTLOOK}/OUTLOOK/0`
        return {}
      } else if (accessMode === 'OFFICE365') {
        window.location.hash = `/mailbox_wizard/${ACCOUNT_TEMPLATE_TYPES.OFFICE365}/OFFICE365/0`
        return {}
      }
    }

    return {}
  }

  /**
  * Creates a mailbox group from a template
  * @param template: the template to use to create the account
  */
  authMailboxGroupFromTemplate (template) {
    return { template: template }
  }

  /* **************************************************************************/
  // Mailbox Auth callbacks
  /* **************************************************************************/

  /**
  * Handles an auth request mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /**
  * Handles a Google account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authGoogleSuccess (evt, payload) {
    return payload
  }

  /**
  * Handles a Slack account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authSlackSuccess (evt, payload) {
    return payload
  }

  /**
  * Handles a Trello account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authTrelloSuccess (evt, payload) {
    return payload
  }

  /**
  * Handles a Microsoft account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authMicrosoftSuccess (evt, payload) {
    return payload
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
  /*authenticateMailbox (MailboxClass, accessMode = undefined, provisionalJS = undefined) {
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
  }*/

  /**
  * Starts the auth process for google inbox
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  /*authenticateGinboxMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = GoogleMailbox.sanitizeProvisionalJS(provisionalJS, GoogleDefaultService.ACCESS_MODES.GINBOX)
    } else {
      provisionalJS = GoogleMailbox.createJS(CoreMailbox.provisionId(), GoogleDefaultService.ACCESS_MODES.GINBOX)
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }*/

  /**
  * Starts the auth process for gmail
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  /*authenticateGmailMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = GoogleMailbox.sanitizeProvisionalJS(provisionalJS, GoogleDefaultService.ACCESS_MODES.GMAIL)
    } else {
      provisionalJS = GoogleMailbox.createJS(CoreMailbox.provisionId(), GoogleDefaultService.ACCESS_MODES.GMAIL)
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }*/

  /**
  * Starts the auth process for slack
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  /*authenticateSlackMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = SlackMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = SlackMailbox.createJS(CoreMailbox.provisionId())
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }*/

  /**
  * Starts the auth process for trello
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  /*authenticateTrelloMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = TrelloMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = TrelloMailbox.createJS(CoreMailbox.provisionId())
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }*/

  /**
  * Starts the auth process for outlook
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  * @param additionalPermissions=[]: additional permissions to request
  */
  /*authenticateOutlookMailbox (provisionalJS = undefined, additionalPermissions = []) {
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
  }*/

  /**
  * Starts the auth process for office 365
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  * @param additionalPermissions=[]: additional permissions to request
  */
  /*authenticateOffice365Mailbox (provisionalJS = undefined, additionalPermissions = []) {
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
  }*/

  /**
  * Starts the auth process for generic mailbox
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  /*authenticateGenericMailbox (provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = GenericMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = GenericMailbox.createJS(CoreMailbox.provisionId())
    }
    return { provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }*/

  /**
  * Starts the auth process for generic mailbox
  * @param containerId: the id of the container to use
  * @param provisionalJS=undefined: the provisional json object to create the mailbox
  */
  /*authenticateContainerMailbox (containerId, provisionalJS = undefined) {
    if (provisionalJS) {
      provisionalJS = ContainerMailbox.sanitizeProvisionalJS(provisionalJS)
    } else {
      provisionalJS = ContainerMailbox.createJS(CoreMailbox.provisionId())
    }
    return { containerId: containerId, provisionalJS: provisionalJS, provisionalId: provisionalJS.id }
  }*/

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  /**
  * Reauthenticates a mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  //reauthenticateMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a google mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  //reauthenticateGoogleMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a microsoft mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  //reauthenticateMicrosoftMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a slack mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  //reauthenticateSlackMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /**
  * Reauthenticates a trello mailbox
  * @param mailboxId: the id of the mailbox to reauthetnicate
  */
  //reauthenticateTrelloMailbox (mailboxId) { return { mailboxId: mailboxId } }

  /* **************************************************************************/
  // Mailbox Auth callbacks
  /* **************************************************************************/

  /**
  * Handles a Google mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authGoogleMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      temporaryCode: data.temporaryCode,
      pushToken: data.pushToken,
      authMode: data.authMode,
      codeRedirectUri: data.codeRedirectUri
    }
  }*/

  /**
  * Handles a mailbox authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  /*authGoogleMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }*/

  /**
  * Handles a slack mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authSlackMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      teamUrl: data.teamUrl,
      token: data.token,
      authMode: data.authMode
    }
  }*/

  /**
  * Handles a slack mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authSlackMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }*/

  /**
  * Handles a Trello mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authTrelloMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      authToken: data.token,
      authAppKey: data.appKey,
      authMode: data.authMode
    }
  }*/

  /**
  * Handles a Trello mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authTrelloMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }*/

  /**
  * Handles a Microsoft mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authMicrosoftMailboxSuccess (evt, data) {
    return {
      provisionalId: data.id,
      provisional: data.provisional,
      temporaryCode: data.temporaryCode,
      authMode: data.authMode,
      codeRedirectUri: data.codeRedirectUri
    }
  }*/

  /**
  * Handles a Microsoft mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  /*authMicrosoftMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }*/

  /* **************************************************************************/
  // Sync
  /* **************************************************************************/

  /**
  * Triggers a full sync on a service
  * @param id: the id of the mailbox
  */
  fullSyncService (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Snapshots
  /* **************************************************************************/

  /**
  * Sets a snapshot of a service
  * @param serviceId: the service type
  * @param snapshot: the snapshot as a base64 string
  */
  setServiceSnapshot (serviceId, snapshot) {
    return { serviceId: serviceId, snapshot: snapshot }
  }

  /* **************************************************************************/
  // Search
  /* **************************************************************************/

  /**
  * Starts searching the service
  * @param serviceId=optional: the service id
  * @param service=optional: the type of service to search for
  */
  startSearchingService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Stops searching the service but in a way that simply stops tracking the search process
  * Best to use this if search is not handled by us to unmount the track
  */
  untrackSearchingService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Stops searching the service
  * @param serviceId=optional: the service id
  */
  stopSearchingService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Sets the search term
  * @param serviceId=optional: the mailbox id
  * @param str: the search string
  */
  setServiceSearchTerm (serviceId, str) {
    return { serviceId: serviceId, str: str }
  }

  /**
  * Searches for the next occurance of the search term
  * @param serviceId=optional: the service id
  */
  searchServiceNextTerm (serviceId) {
    return { serviceId: serviceId }
  }
}

const actions = alt.createActions(AccountActions)

// Auth
ipcRenderer.on(WB_AUTH_GOOGLE_COMPLETE, actions.authGoogleSuccess)
ipcRenderer.on(WB_AUTH_GOOGLE_ERROR, actions.authFailure)
ipcRenderer.on(WB_AUTH_SLACK_COMPLETE, actions.authSlackSuccess)
ipcRenderer.on(WB_AUTH_SLACK_ERROR, actions.authFailure)
ipcRenderer.on(WB_AUTH_TRELLO_COMPLETE, actions.authTrelloSuccess)
ipcRenderer.on(WB_AUTH_TRELLO_ERROR, actions.authFailure)
ipcRenderer.on(WB_AUTH_MICROSOFT_COMPLETE, actions.authMicrosoftSuccess)
ipcRenderer.on(WB_AUTH_MICROSOFT_ERROR, actions.authFailure)

// Mailbox modifiers
ipcRenderer.on(WB_WINDOW_FIND_START, () => actions.startSearchingService())
ipcRenderer.on(WB_WINDOW_FIND_NEXT, () => actions.searchServiceNextTerm())

export default actions
