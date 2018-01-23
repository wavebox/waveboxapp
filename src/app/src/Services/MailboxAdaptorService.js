import { app } from 'electron'
import UrlPattern from 'url-pattern'
import WINDOW_BACKING_TYPES from 'windows/WindowBackingTypes'
import WaveboxWindow from 'windows/WaveboxWindow'
import { mailboxStore } from 'stores/mailbox'

class MailboxAdaptorService {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    app.on('web-contents-created', this._handleWebContentsCreated)
  }

  /* ****************************************************************************/
  // Event listeners
  /* ****************************************************************************/

  /**
  * Handles a new web contents being created
  * @param evt: the event that fired
  * @param wc: the web contents that were created
  */
  _handleWebContentsCreated = (evt, wc) => {
    wc.on('dom-ready', this._handleWebContentsDomReady)
  }

  /**
  * Handles a webcontents dom being ready
  * @param evt: the event that fired
  */
  _handleWebContentsDomReady = (evt) => {
    const tabInfo = WaveboxWindow.tabMetaInfo(evt.sender.id)
    if (!tabInfo) { return }
    if (tabInfo.backing !== WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return }

    const mailbox = mailboxStore.getState().getMailbox(tabInfo.mailboxId)
    if (!mailbox) { return }
    const service = mailbox.serviceForType(tabInfo.serviceType)
    if (!service) { return }

    this._executeAdaptors(evt.sender, service)
  }

  /* ****************************************************************************/
  // Adaptor exec
  /* ****************************************************************************/

  /**
  * Executes an adaptor
  * @param webContents: the webcontents to execute on
  * @param service: the service we're executing for
  */
  _executeAdaptors (webContents, service) {
    if (!service.adaptors.length) { return }

    const currentUrl = webContents.getURL()
    const adaptors = service.adaptors.filter((adaptor) => {
      const match = adaptor.matches.find((patternStr) => {
        const pattern = new UrlPattern(patternStr)
        return pattern.match(currentUrl) !== null
      })
      return match !== undefined
    })

    if (adaptors.length) {
      adaptors.forEach((adaptor) => {
        if (adaptor.hasStyles) {
          webContents.insertCSS(adaptor.styles)
        }
        if (adaptor.hasJS) {
          webContents.executeJavaScript(adaptor.JS)
        }
      })
    }
  }
}

export default MailboxAdaptorService
