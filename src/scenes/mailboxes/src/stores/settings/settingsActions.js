import alt from '../alt'
import { SEGMENTS } from 'shared/Models/Settings/SettingsIdent'
import {
  WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR,
  WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU,
  WB_QUIT_APP
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class SettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

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
  * @param show: true to show the unread count in the titlebar
  */
  setShowTitlebarUnreadCount (show) {
    return this.update(SEGMENTS.UI, 'showTitlebarCount', show)
  }

  /**
  * @param show: true to show the account info in the titlebar
  */
  setShowTitlebarAccount (show) {
    return this.update(SEGMENTS.UI, 'showTitlebarAccount', show)
  }

  /**
  * @param show: true to show the badge, false otherwise
  */
  setShowAppBadge (show) {
    return this.update(SEGMENTS.UI, 'showAppBadge', show)
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

  /**
  * @param show: true to show the support button in the sidebar
  */
  setShowSidebarSupport (show) {
    return this.update(SEGMENTS.UI, 'showSidebarSupport', show)
  }

  /**
  * @param mode: the mode to show the newsfeed button in the sidebar
  */
  setShowSidebarNewsfeed (mode) {
    return this.update(SEGMENTS.UI, 'showSidebarNewsfeed', mode)
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
  * @param disable: true to disable hardware acceleration
  */
  disableHardwareAcceleration (disable) {
    return this.update(SEGMENTS.APP, 'disableHardwareAcceleration', disable)
  }

  /**
  * @param toggled: true to check for updates
  */
  checkForUpdates (toggled) {
    return this.update(SEGMENTS.APP, 'checkForUpdates', toggled)
  }

  /**
  * @param channel: the new update channel
  */
  setUpdateChannel (channel) {
    return this.update(SEGMENTS.APP, 'updateChannel', channel)
  }

  /**
  * @param hasSeen: true if the user has seen the app tour
  */
  setHasSeenTour (hasSeen) {
    return this.update(SEGMENTS.APP, 'hasSeenAppTour', hasSeen)
  }

  /**
  * @param hasSeen: true if the user has seen the app wizard
  */
  setHasSeenAppWizard (hasSeen) {
    return { hasSeen: hasSeen }
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

  /**
  * Sets whether the user has seen the snap update message
  * @param seen: true if seen
  */
  setHasSeenSnapSetupMessage (seen) {
    return this.update(SEGMENTS.APP, 'hasSeenSnapSetupMessage', seen)
  }

  /**
  * Sets whether geolocation api requests are granted or not
  * @param enabled: true to enable, false to disable
  */
  setEnableGeolocationApi (enabled) {
    return this.update(SEGMENTS.APP, 'enableGeolocationApi', enabled)
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
  * @param remove: true to remove the app from the dock when no windows are visible
  */
  setRemoveFromDockDarwin (remove) {
    return this.update(SEGMENTS.TRAY, 'removeFromDockDarwin', remove)
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

  /**
  * @param val: the new update mode
  */
  setTrayGtkUpdateMode (val) {
    return this.update(SEGMENTS.TRAY, 'gtkUpdateMode', val)
  }

  /* **************************************************************************/
  // Extensions
  /* **************************************************************************/

  /**
  * @param enable: true to enable chrome extension support, false otherwise
  */
  setExtensionEnableChromeExperimental (enable) {
    return this.update(SEGMENTS.EXTENSION, 'enableChromeExperimental', enable)
  }

  /**
  * @param show: true to show browser actions in the toolbar
  */
  setExtensionShowBrowserActionsInToolbar (show) {
    return this.update(SEGMENTS.EXTENSION, 'showBrowserActionsInToolbar', show)
  }

  /**
  * @param layout: the layout mode for the toolbar
  */
  setExtensionToolbarBrowserActionLayout (layout) {
    return this.update(SEGMENTS.EXTENSION, 'toolbarBrowserActionLayout', layout)
  }
}

const actions = alt.createActions(SettingsActions)
ipcRenderer.on(WB_MAILBOXES_WINDOW_TOGGLE_SIDEBAR, actions.toggleSidebar)
ipcRenderer.on(WB_MAILBOXES_WINDOW_TOGGLE_APP_MENU, actions.toggleAppMenu)

export default actions
