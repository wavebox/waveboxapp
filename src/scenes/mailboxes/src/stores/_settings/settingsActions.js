import RendererSettingsActions from 'shared/AltStores/Settings/RendererSettingsActions'
import subActionsFactory from 'shared/AltStores/Settings/settingsSubactions'
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
  * Quits the tour
  */
  tourQuit () { return {} }
}

const actions = alt.createActions(SettingsActions)
actions.sub = subActionsFactory(actions)

export default actions


//TODO
/*
const actions = alt.createActions(SettingsActions)
ipcRenderer.on(WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR, actions.toggleSidebar)
ipcRenderer.on(WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU, actions.toggleAppMenu)
ipcRenderer.on(WB_MAILBOXES_WINDOW_CHANGE_PRIMARY_SPELLCHECK_LANG, (evt, data) => actions.setSpellcheckerLanguage(data.lang))
*/
