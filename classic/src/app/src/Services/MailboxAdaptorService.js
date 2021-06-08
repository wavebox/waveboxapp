import { app } from 'electron'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { accountStore } from 'stores/account'
import { SAPIRunner } from 'Extensions/ServiceApi'

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

    const service = accountStore.getState().getService(tabInfo.serviceId)
    if (!service) { return }

    SAPIRunner.executeAdaptors(evt.sender, service)
  }
}

export default MailboxAdaptorService
