import PropTypes from 'prop-types'
import React from 'react'
import { BLANK_PNG } from 'shared/b64Assets'
import TrayRenderer from './TrayRenderer'
import uuid from 'uuid'
import {
  IS_GTK_PLATFORM,
  GTK_UPDATE_MODES
} from 'shared/Models/Settings/TraySettings'
import { ipcRenderer, remote } from 'electron'
import Resolver from 'Runtime/Resolver'
import { WB_TOGGLE_TRAY_POPOUT } from 'shared/ipcEvents'

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
      this.appTray = new remote.Tray(resizedImage)
    } else {
      this.appTray = new remote.Tray(remote.nativeImage.createFromDataURL(BLANK_PNG))
    }

    //TODO test tray click behaviour on.... darwin, darwin-maveriks, win10, win7, linux-libappindicator, linux-gtkicon
    //TODO click and double click behaviour is currently depricated from classic. Maybe bring back with alt/ctrl/shift etc
    this.appTray.on('click', this.handleClick)
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
    const actionKey = evt.altKey || evt.ctrlKey || evt.shiftKey || evt.metaKey
    ipcRenderer.send(WB_TOGGLE_TRAY_POPOUT, bounds, actionKey)
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
            this.appTray.destroy()
            this.appTray = new remote.Tray(image)
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
