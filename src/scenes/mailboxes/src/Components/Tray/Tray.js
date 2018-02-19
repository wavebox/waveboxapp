import PropTypes from 'prop-types'
import React from 'react'
import { BLANK_PNG } from 'shared/b64Assets'
import TrayRenderer from './TrayRenderer'
import uuid from 'uuid'
import {
  IS_GTK_PLATFORM,
  GTK_UPDATE_MODES,
  CLICK_ACTIONS,
  SUPPORTS_RIGHT_CLICK,
  SUPPORTS_DOUBLE_CLICK
} from 'shared/Models/Settings/TraySettings'
import { ipcRenderer, remote } from 'electron'
import Resolver from 'Runtime/Resolver'
import {
  WB_TOGGLE_TRAY_POPOUT,
  WB_HIDE_TRAY_POPOUT,
  WB_SHOW_TRAY_POPOUT,
  WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY,
  WB_SHOW_MAILBOX_WINDOW_FROM_TRAY,
  WB_HIDE_MAILBOX_WINDOW_FROM_TRAY
} from 'shared/ipcEvents'

export default class Tray extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    unreadCount: PropTypes.number.isRequired,
    traySettings: PropTypes.object.isRequired,
    launchTraySettings: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    const { launchTraySettings } = this.props
    if (IS_GTK_PLATFORM && launchTraySettings.gtkUpdateMode === GTK_UPDATE_MODES.STATIC) {
      const image = remote.nativeImage.createFromPath(Resolver.icon('app_64.png', Resolver.API_TYPES.NODE))
      const resizedImage = image.resize({ width: launchTraySettings.iconSize, height: launchTraySettings.iconSize })
      this.appTray = this.createTray(resizedImage)
    } else {
      this.appTray = this.createTray(remote.nativeImage.createFromDataURL(BLANK_PNG))
    }
  }

  componentWillUnmount () {
    this.appTray = this.destroyTray(this.appTray)
  }

  /* **************************************************************************/
  // Tray utils
  /* **************************************************************************/

  /**
  * Creates a new tray and ensures all callbacks are bound
  * @param image: the initial image to use
  * @return the new tray
  */
  createTray (image) {
    const tray = new remote.Tray(image)
    tray.on('click', this.handleClick)
    if (SUPPORTS_RIGHT_CLICK) {
      tray.on('right-click', this.handleRightClick)
    }
    if (SUPPORTS_DOUBLE_CLICK) {
      tray.on('double-click', this.handleDoubleClick)
    }
    return tray
  }

  /**
  * Destroys a tray
  * @param tray: the tray to destroy
  * @return null
  */
  destroyTray (tray) {
    if (tray) {
      tray.destroy()
    }
    return null
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a click event on the tray
  * @param evt: the event that fired
  * @param bounds: the bounds of the tray icon
  */
  handleClick = (evt, bounds) => {
    if (evt.altKey || evt.ctrlKey || evt.shiftKey || evt.metaKey) {
      this.dispatchClickAction(this.props.traySettings.altClickAction, bounds)
    } else {
      this.dispatchClickAction(this.props.traySettings.clickAction, bounds)
    }
  }

  /**
  * Handles a click event on the tray
  * @param evt: the event that fired
  * @param bounds: the bounds of the tray icon
  */
  handleRightClick = (evt, bounds) => {
    this.dispatchClickAction(this.props.traySettings.rightClickAction, bounds)
  }

  /**
  * Handles a click event on the tray
  * @param evt: the event that fired
  * @param bounds: the bounds of the tray icon
  */
  handleDoubleClick = (evt, bounds) => {
    this.dispatchClickAction(this.props.traySettings.doubleClickAction, bounds)
  }

  /**
  * Dispatches a click action
  * @param action: the action to dispatch
  * @param bounds: the current tray bounds
  */
  dispatchClickAction (action, bounds) {
    switch (action) {
      case CLICK_ACTIONS.TOGGLE_POPOUT:
        ipcRenderer.send(WB_TOGGLE_TRAY_POPOUT, bounds)
        break
      case CLICK_ACTIONS.HIDE_POPOUT:
        ipcRenderer.send(WB_HIDE_TRAY_POPOUT)
        break
      case CLICK_ACTIONS.SHOW_POPOUT:
        ipcRenderer.send(WB_SHOW_TRAY_POPOUT, bounds)
        break
      case CLICK_ACTIONS.TOGGLE_APP:
        ipcRenderer.send(WB_TOGGLE_MAILBOX_WINDOW_FROM_TRAY)
        break
      case CLICK_ACTIONS.HIDE_APP:
        ipcRenderer.send(WB_HIDE_MAILBOX_WINDOW_FROM_TRAY)
        break
      case CLICK_ACTIONS.SHOW_APP:
        ipcRenderer.send(WB_SHOW_MAILBOX_WINDOW_FROM_TRAY)
        break
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Be really careful here. The tray icon on linux flickers if you update it too
  * freqently
  */
  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.unreadCount !== nextProps.unreadCount) { return true }

    const trayDiff = [
      'unreadColor',
      'unreadBackgroundColor',
      'readColor',
      'readBackgroundColor',
      'showUnreadCount',
      'dpiMultiplier',
      'iconSize'
    ].findIndex((k) => {
      return this.props.traySettings[k] !== nextProps.traySettings[k]
    }) !== -1
    if (trayDiff) { return true }

    return false
  }

  /**
  * @return the tooltip string for the tray icon
  */
  renderTooltip () {
    const {unreadCount} = this.props
    if (unreadCount === 1) {
      return `1 unread item`
    } else if (unreadCount > 1) {
      return `${unreadCount} unread items`
    } else {
      return 'No unread items'
    }
  }

  render () {
    const {
      unreadCount,
      traySettings,
      launchTraySettings
    } = this.props

    // Making subsequent calls to the promise can cause the return order to change
    // Guard against this using the renderId
    const renderId = uuid.v4()
    this.renderId = renderId

    TrayRenderer.renderNativeImage(traySettings.iconSize, traySettings, unreadCount)
      .then((image) => {
        if (this.renderId !== renderId) { return } // Someone got in before us

        // Update the icon
        if (IS_GTK_PLATFORM) {
          if (launchTraySettings.gtkUpdateMode === GTK_UPDATE_MODES.RECREATE) {
            this.appTray = this.destroyTray(this.appTray)
            this.appTray = this.createTray(image)
          } else if (launchTraySettings.gtkUpdateMode === GTK_UPDATE_MODES.UPDATE) {
            this.appTray.setImage(image)
          }
          // We don't update the image on static
        } else {
          this.appTray.setImage(image)
        }
        this.appTray.setToolTip(this.renderTooltip())
      })

    return (<div />)
  }
}
