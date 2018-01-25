import RendererSettingsActions from 'shared/AltStores/Settings/RendererSettingsActions'
import subActionsFactory from 'shared/AltStores/Settings/SettingsSubActions'
import alt from '../alt'

class SettingsActions extends RendererSettingsActions {
  /* **************************************************************************/
  // News Sync
  /* **************************************************************************/

  /**
  * Starts syncing the news
  */
  startSyncingNews () { return {} }

  /**
  * Stops syncing the news
  */
  stopSyncingNews () { return {} }

  /**
  * Opens the latest news and marks it as seen
  */
  openAndMarkNews () { return {} }

  /* **************************************************************************/
  // Tour
  /* **************************************************************************/

  /**
  * Starts the app tour
  */
  tourStart () { return {} }

  /**
  * Progresses the tour
  */
  tourNext () { return {} }

  /**
  * Progresses the tour but only if it's running
  */
  tourNextIfActive () { return {} }

  /**
  * Quits the tour
  */
  tourQuit () { return {} }
}

const actions = alt.createActions(SettingsActions)
actions.sub = subActionsFactory(actions)

export default actions
