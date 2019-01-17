import CoreLocalHistoryStore from './CoreLocalHistoryStore'
import { ACTIONS_NAME } from './AltLocalHistoryIdentifiers'
import Download from '../../Models/LocalHistory/Download'

class RendererLocalHistoryStore extends CoreLocalHistoryStore {
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
      handleRemoteSetInactiveDownload: actions.REMOTE_SET_INACTIVE_DOWNLOAD,
      handleRemoteSetActiveDownload: actions.REMOTE_SET_ACTIVE_DOWNLOAD
    })
  }

  /* **************************************************************************/
  // Mailbox
  /* **************************************************************************/

  handleRemoteSetInactiveDownload ({ id, downloadJS, remove }) {
    if (id) {
      if (downloadJS) {
        this._downloads_.inactive.set(id, new Download(downloadJS))
      } else {
        this._downloads_.inactive.delete(id)
      }
    }

    (remove || []).forEach((id) => this._downloads_.inactive.delete(id))
  }

  handleRemoteSetActiveDownload ({ id, downloadJS }) {
    if (id) {
      if (downloadJS) {
        this._downloads_.active.set(id, new Download(downloadJS))
      } else {
        this._downloads_.active.delete(id)
      }
    }
  }
}

export default RendererLocalHistoryStore
