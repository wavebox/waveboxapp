import alt from '../alt'
import URI from 'urijs'
import addressparser from 'addressparser'
import { WB_MAILBOXES_WINDOW_OPEN_MAILTO_LINK, WB_FOCUS_APP } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class ComposeActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * Basically a no-op but ensures that the ipcRenderer events are bound
  */
  load () { return {} }

  /* **************************************************************************/
  // New Message
  /* **************************************************************************/

  /**
  * Asks the user where they would like to start composing a new message
  */
  composeNewMessage () { return {} }

  /**
  * Clears the current compose
  */
  cancelCompose () { return {} }

  /**
  * Starts composing a new message in the designated window
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  composeMessageInMailbox (mailboxId, serviceType) {
    return { mailboxId: mailboxId, serviceType: serviceType }
  }

  /**
  * Opens a mailto link
  * @param mailtoLink='': the link to try to open
  * @param preferredMailboxId=undefined: if specified and valid will open the link in the given mailbox id
  * @param preferredServiceType=undefined: if specified and valid will open the link in the given service type
  */
  processMailtoLink (mailtoLink = '', preferredMailboxId = undefined, preferredServiceType = undefined) {
    if (mailtoLink.indexOf('mailto:') === 0) {
      ipcRenderer.send(WB_FOCUS_APP, { })
      const uri = URI(mailtoLink || '')
      const recipients = addressparser(decodeURIComponent(uri.pathname())).map((r) => r.address)
      const qs = uri.search(true)
      return {
        valid: true,
        recipient: recipients.join(','),
        subject: qs.subject || qs.Subject,
        body: qs.body || qs.Body,
        preferredMailboxId: preferredMailboxId,
        preferredServiceType: preferredServiceType
      }
    } else {
      return { valid: false }
    }
  }
}

const actions = alt.createActions(ComposeActions)
ipcRenderer.on(WB_MAILBOXES_WINDOW_OPEN_MAILTO_LINK, (evt, req) => actions.processMailtoLink(req.mailtoLink))
export default actions
