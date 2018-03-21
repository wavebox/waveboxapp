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
  * @param remove: true to remove the app from the taskbar on minimize
  */
  setRemoveFromTaskbarWin32 (remove) {
    this.dispatchUpdate('removeFromTaskbarWin32', remove)
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
  * @param position: the new position
  */
  setPopoutPosition (position) {
    this.dispatchUpdate('popoutPosition', position)
  }

  /**
  * Sets the click action
  * @param action
  */
  setClickAction (action) {
    this.dispatchUpdate('clickAction', action)
  }

  /**
  * Sets the alt click action
  * @param action
  */
  setAltClickAction (action) {
    this.dispatchUpdate('altClickAction', action)
  }

  /**
  * Sets the right click action
  * @param action
  */
  setRightClickAction (action) {
    this.dispatchUpdate('rightClickAction', action)
  }

  /**
  * Sets the double click action
  * @param action
  */
  setDoubleClickAction (action) {
    this.dispatchUpdate('doubleClickAction', action)
  }

  /**
  * @param val: the new update mode
  */
  setTrayGtkUpdateMode (val) {
    this.dispatchUpdate('gtkUpdateMode', val)
  }
}

export default TraySettingsActions
