import alt from '../alt'
import { SEGMENTS } from 'shared/Models/Settings/SettingsIdent'
import {
  WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR,
  WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU,
  WB_QUIT_APP
} from 'shared/ipcEvents'
const {ipcRenderer} = window.nativeRequire('electron')

class SettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Updates a value
  * @param segment: the segment to update
  * @param changesetOrKey: either a dict of k -> or a single key
  * @param undefinedOrVal: if changesetOrKey is a key, this should be the value
  */
  update (segment, changesetOrKey, undefinedOrVal) {
    if (typeof (changesetOrKey) === 'string') {
      const changeset = {}
      changeset[changesetOrKey] = undefinedOrVal
      return { segment: segment, updates: changeset }
    } else {
      return { segment: segment, updates: changesetOrKey }
    }
  }

  /**
  * Toggles a value
  * @param segment: the segment to update
  * @param key: the key to toggle
  */
  toggle (segment, key) {
    return { segment: segment, key: key }
  }

  /* **************************************************************************/
  // Accelerators
  /* **************************************************************************/

  /**
  * Sets an accelerator
  * @param name: the name of the accelerator
  * @param signature: three element array signature
  */
  setAccelerator (name, signature) {
    return this.update(SEGMENTS.ACCELERATORS, name, signature)
  }

  /**
  * Restores an accelerator to its default value
  * @param name: the name of the accelerator
  */
  restoreAcceleratorDefault (name) {
    return this.update(SEGMENTS.ACCELERATORS, name, undefined)
  }

  /* **************************************************************************/
  // Language
  /* **************************************************************************/

  /**
  * @param enabled: true to enable the spell checker, false otherwise
  */
  setEnableSpellchecker (enabled) {
    return this.update(SEGMENTS.LANGUAGE, 'spellcheckerEnabled', enabled)
  }

  /**
  * @param lang: the language to set to
  */
  setSpellcheckerLanguage (lang) { return {lang: lang} }

  /**
  * @param lang: the language to set to
  */
  setSecondarySpellcheckerLanguage (lang) { return {lang: lang} }

  /* **************************************************************************/
  // OS
  /* **************************************************************************/

  /**
  * @param ask: true to always ask, false otherwise
  */
  setAlwaysAskDownloadLocation (ask) {
    return this.update(SEGMENTS.OS, 'alwaysAskDownloadLocation', ask)
  }

  /**
  * @param path: the path to download files to automatically
  */
  setDefaultDownloadLocation (path) {
    return this.update(SEGMENTS.OS, 'defaultDownloadLocation', path)
  }

  /**
  * @param enabled: true to enable download complete notifications
  */
  setDownloadNotificationEnabled (enabled) {
    return this.update(SEGMENTS.OS, 'downloadNotificationEnabled', enabled)
  }

  /**
  * @param enabled: true to enable sound on download complete notifications
  */
  setDownloadNotificationSoundEnabled (enabled) {
    return this.update(SEGMENTS.OS, 'downloadNotificationSoundEnabled', enabled)
  }

  /**
  * @param enabled: true to enable notifications, false otherwise
  */
  setNotificationsEnabled (enabled) {
    return this.update(SEGMENTS.OS, 'notificationsEnabled', enabled)
  }

  /**
  * @param silent: true to make notifications silent, false otherwise
  */
  setNotificationsSilent (silent) {
    return this.update(SEGMENTS.OS, 'notificationsSilent', silent)
  }

  /**
  * @param provider: the new provider to use
  */
  setNotificationsProvider (provider) {
    return this.update(SEGMENTS.OS, 'notificationsProvider', provider)
  }

  /**
  * @param sound: the new sound to use
  */
  setNotificationsSound (sound) {
    return this.update(SEGMENTS.OS, 'notificationsSound', sound)
  }

  /**
  * @param background: true to open links in the background
  */
  setOpenLinksInBackground (background) {
    return this.update(SEGMENTS.OS, 'openLinksInBackground', background)
  }

  /**
  * @param mode: the login open mode
  */
  setLoginOpenMode (mode) {
    return this.update(SEGMENTS.OS, 'loginOpenMode', mode)
  }

  /* **************************************************************************/
  // UI
  /* **************************************************************************/

  /**
  * @param show: true to show the titlebar, false otherwise
  */
  setShowTitlebar (show) {
    return this.update(SEGMENTS.UI, 'showTitlebar', show)
  }

  /**
  * @param show: true to show the badge, false otherwise
  */
  setShowAppBadge (show) {
    return this.update(SEGMENTS.UI, 'showAppBadge', show)
  }

  /**
  * @param show: true to show the unread count in the titlebar
  */
  setShowTitlebarUnreadCount (show) {
    return this.update(SEGMENTS.UI, 'showTitlebarCount', show)
  }

  /**
  * @param show: true to show the app menu, false otherwise
  */
  setShowAppMenu (show) {
    return this.update(SEGMENTS.UI, 'showAppMenu', show)
  }

  /**
  * Toggles the app menu
  */
  toggleAppMenu () {
    return this.toggle(SEGMENTS.UI, 'showAppMenu')
  }

  /**
  * @param enabled: true to enable the sidebar, false otherwise
  */
  setEnableSidebar (enabled) {
    return this.update(SEGMENTS.UI, 'sidebarEnabled', enabled)
  }

  /**
  * Toggles the sidebar
  */
  toggleSidebar () {
    return this.toggle(SEGMENTS.UI, 'sidebarEnabled')
  }

  /**
  * Opens the app hidden by default
  */
  setOpenHidden (toggled) {
    return this.update(SEGMENTS.UI, 'openHidden', toggled)
  }

  /**
  * @param show: true to show sleepable service indicators
  */
  setShowSleepableServiceIndicator (show) {
    return this.update(SEGMENTS.UI, 'showSleepableServiceIndicator', show)
  }

  /* **************************************************************************/
  // App
  /* **************************************************************************/

  /**
  * @param ignore: true to ignore the gpu blacklist
  */
  ignoreGPUBlacklist (ignore) {
    return this.update(SEGMENTS.APP, 'ignoreGPUBlacklist', ignore)
  }

  /**
  * @param enable: true to enable using zoom for dsf
  */
  enableUseZoomForDSF (enable) {
    return this.update(SEGMENTS.APP, 'enableUseZoomForDSF', enable)
  }

  /**
  * @param disable: true to disable smooth scrolling
  */
  disableSmoothScrolling (disable) {
    return this.update(SEGMENTS.APP, 'disableSmoothScrolling', disable)
  }

  /**
  * @param toggled: true to check for updates
  */
  checkForUpdates (toggled) {
    return this.update(SEGMENTS.APP, 'checkForUpdates', toggled)
  }

  /**
  * @param hasSeen: true if the user has seen the app wizard
  */
  setHasSeenAppWizard (hasSeen) {
    return this.update(SEGMENTS.APP, 'hasSeenAppWizard', hasSeen)
  }

  /**
  * Marks the EULA as being agreed
  */
  acceptEULA () {
    return this.update(SEGMENTS.APP, 'hasAgreedToEULA', true)
  }

  /**
  * Declines the EULA and quits the app
  */
  declineEULA () {
    ipcRenderer.send(WB_QUIT_APP, {})
    return {}
  }

  /**
  * Sets that an account message url has been seen
  * @param url: the url to set as seen
  */
  setSeenAccountMessageUrl (url) {
    return this.update(SEGMENTS.APP, 'lastSeenAccountMessageUrl', url)
  }

  /* **************************************************************************/
  // Tray
  /* **************************************************************************/

  /**
  * @param show: true to show the tray icon, false otherwise
  */
  setShowTrayIcon (show) {
    return this.update(SEGMENTS.TRAY, 'show', show)
  }

  /**
  * @param show: true to show the unread count in the tray
  */
  setShowTrayUnreadCount (show) {
    return this.update(SEGMENTS.TRAY, 'showUnreadCount', show)
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayReadColor (col) {
    return this.update(SEGMENTS.TRAY, 'readColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon background
  */
  setTrayReadBackgroundColor (col) {
    return this.update(SEGMENTS.TRAY, 'readBackgroundColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayUnreadColor (col) {
    return this.update(SEGMENTS.TRAY, 'unreadColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon background
  */
  setTrayUnreadBackgroundColor (col) {
    return this.update(SEGMENTS.TRAY, 'unreadBackgroundColor', col)
  }

  /**
  * @param val: the multiplier to apply to the tray icon
  */
  setDpiMultiplier (val) {
    return this.update(SEGMENTS.TRAY, 'dpiMultiplier', parseInt(val))
  }

  /**
  * @param val: the icon size in pixels
  */
  setTrayIconSize (val) {
    val = parseInt(val)
    return this.update(SEGMENTS.TRAY, 'iconSize', isNaN(val) ? undefined : val)
  }

  /**
  * @param enabled: true to hide the window when minimized, false otherwise
  */
  setHideWhenMinimized (enabled) {
    return this.update(SEGMENTS.TRAY, 'hideWhenMinimized', enabled)
  }

  /**
  * Toggles whether to hide when minimized
  */
  toggleHideWhenMinimized () {
    return this.toggle(SEGMENTS.TRAY, 'hideWhenMinimized')
  }

  /**
  * @param enabled: true to hide the window when closed, false otherwise
  */
  setHideWhenClosed (enabled) {
    return this.update(SEGMENTS.TRAY, 'hideWhenClosed', enabled)
  }

  /**
  * Toggles whether to hide when closed
  */
  toggleHideWhenClosed () {
    return this.toggle(SEGMENTS.TRAY, 'hideWhenClosed')
  }

  /**
  * @param val: the mouse clicks that will trigger the action
  */
  setMouseTrigger (val) {
    return this.update(SEGMENTS.TRAY, 'mouseTrigger', val)
  }

  /**
  * @param val: the action to take when the mouse is triggered
  */
  setMouseTriggerAction (val) {
    return this.update(SEGMENTS.TRAY, 'mouseTriggerAction', val)
  }
}

const actions = alt.createActions(SettingsActions)
ipcRenderer.on(WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR, actions.toggleSidebar)
ipcRenderer.on(WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU, actions.toggleAppMenu)

export default actions
