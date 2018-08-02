import { SettingsIdent } from '../../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'

class UISettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.UI, actions)
  }

  /* **************************************************************************/
  // Dispatch
  /* **************************************************************************/

  /**
  * @param show: true to show the titlebar, false otherwise
  */
  setShowTitlebar (show) {
    this.dispatchUpdate('showTitlebar', show)
  }

  /**
  * @param show: true to show the unread count in the titlebar
  */
  setShowTitlebarUnreadCount (show) {
    this.dispatchUpdate('showTitlebarCount', show)
  }

  /**
  * @param show: true to show the account info in the titlebar
  */
  setShowTitlebarAccount (show) {
    this.dispatchUpdate('showTitlebarAccount', show)
  }

  /**
  * @param show: true to show the badge, false otherwise
  */
  setShowAppBadge (show) {
    this.dispatchUpdate('showAppBadge', show)
  }

  /**
  * @param show: true to show the app menu, false otherwise
  */
  setShowAppMenu (show) {
    this.dispatchUpdate('showAppMenu', show)
  }

  /**
  * Toggles the app menu
  */
  toggleAppMenu () {
    this.dispatchToggle('showAppMenu')
  }

  /**
  * @param enabled: true to enable the sidebar, false otherwise
  */
  setEnableSidebar (enabled) {
    this.dispatchUpdate('sidebarEnabled', enabled)
  }

  /**
  * @param mode: the mode to set for the tooltips
  */
  setAccountTooltipMode (mode) {
    this.dispatchUpdate('accountTooltipMode', mode)
  }

  /**
  * Toggles the sidebar
  */
  toggleSidebar () {
    this.dispatchToggle('sidebarEnabled')
  }

  /**
  * @param collapsed: true to collapse the sidebar controls
  */
  setSidebarControlsCollapsed (collapsed) {
    this.dispatchUpdate('sidebarControlsCollapsed', collapsed)
  }

  /**
  * Opens the app hidden by default
  */
  setOpenHidden (toggled) {
    this.dispatchUpdate('openHidden', toggled)
  }

  /**
  * @param show: true to show sleepable service indicators
  */
  setShowSleepableServiceIndicator (show) {
    this.dispatchUpdate('showSleepableServiceIndicator', show)
  }

  /**
  * @param show: true to show the support button in the sidebar
  */
  setShowSidebarSupport (show) {
    this.dispatchUpdate('showSidebarSupport', show)
  }

  /**
  * @param mode: the mode to show the newsfeed button in the sidebar
  */
  setShowSidebarNewsfeed (mode) {
    this.dispatchUpdate('showSidebarNewsfeed', mode)
  }

  /**
  * @param show: whether to show service sleep notifications or not
  */
  setShowDefaultServiceSleepNotifications (show) {
    this.dispatchUpdate('showDefaultServiceSleepNotifications', show)
  }

  /**
  * @param mode: the mode to set
  */
  setVibrancyMode (mode) {
    this.dispatchUpdate('vibrancyMode', mode)
  }

  /**
  * @param theme: the theme to set
  */
  setTheme (theme) {
    this.dispatchUpdate('theme', theme)
  }

  /**
  * @param size: the new size
  */
  setSidebarSize (size) {
    this.dispatchUpdate('sidebarSize', size)
  }

  /**
  * @param lock: true to lock, false otherwise
  */
  setLockSidebarsAndToolbars (lock) {
    this.dispatchUpdate('lockSidebarsAndToolbars', lock)
  }

  /**
  * @param css: the new css
  */
  setCustomMainCSS (css) {
    this.dispatchUpdate('customMainCSS', css)
  }
}

export default UISettingsActions
