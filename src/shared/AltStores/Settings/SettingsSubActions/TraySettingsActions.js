import { SettingsIdent } from '../../../Models/Settings'
import CoreSettingsActions from './CoreSettingsActions'

class TraySettingsActions extends CoreSettingsActions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param actions: the actions instance to use
  */
  constructor (actions) {
    super(SettingsIdent.SEGMENTS.TRAY, actions)
  }

  /* **************************************************************************/
  // Dispatch
  /* **************************************************************************/

  /**
  * @param show: true to show the tray icon, false otherwise
  */
  setShowTrayIcon (show) {
    this.dispatchUpdate('show', show)
  }

  /**
  * @param remove: true to remove the app from the dock when no windows are visible
  */
  setRemoveFromDockDarwin (remove) {
    this.dispatchUpdate('removeFromDockDarwin', remove)
  }

  /**
  * @param show: true to show the unread count in the tray
  */
  setShowTrayUnreadCount (show) {
    this.dispatchUpdate('showUnreadCount', show)
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayReadColor (col) {
    this.dispatchUpdate('readColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon background
  */
  setTrayReadBackgroundColor (col) {
    this.dispatchUpdate('readBackgroundColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayUnreadColor (col) {
    this.dispatchUpdate('unreadColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon background
  */
  setTrayUnreadBackgroundColor (col) {
    this.dispatchUpdate('unreadBackgroundColor', col)
  }

  /**
  * @param val: the multiplier to apply to the tray icon
  */
  setDpiMultiplier (val) {
    this.dispatchUpdate('dpiMultiplier', parseInt(val))
  }

  /**
  * @param val: the icon size in pixels
  */
  setTrayIconSize (val) {
    val = parseInt(val)
    this.dispatchUpdate('iconSize', isNaN(val) ? undefined : val)
  }

  /**
  * @param enabled: true to hide the window when minimized, false otherwise
  */
  setHideWhenMinimized (enabled) {
    this.dispatchUpdate('hideWhenMinimized', enabled)
  }

  /**
  * Toggles whether to hide when minimized
  */
  toggleHideWhenMinimized () {
    this.dispatchToggle('hideWhenMinimized')
  }

  /**
  * @param enabled: true to hide the window when closed, false otherwise
  */
  setHideWhenClosed (enabled) {
    this.dispatchUpdate('hideWhenClosed', enabled)
  }

  /**
  * Toggles whether to hide when closed
  */
  toggleHideWhenClosed () {
    this.dispatchToggle('hideWhenClosed')
  }

  /**
  * @param val: the mouse clicks that will trigger the action
  */
  setMouseTrigger (val) {
    this.dispatchUpdate('mouseTrigger', val)
  }

  /**
  * @param val: the action to take when the mouse is triggered
  */
  setMouseTriggerAction (val) {
    this.dispatchUpdate('mouseTriggerAction', val)
  }

  /**
  * @param val: the new update mode
  */
  setTrayGtkUpdateMode (val) {
    this.dispatchUpdate('gtkUpdateMode', val)
  }
}

export default TraySettingsActions
