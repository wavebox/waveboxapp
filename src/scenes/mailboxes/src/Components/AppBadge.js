import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
const {nativeImage, app} = remote

class AppBadge extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    unreadCount: PropTypes.number.isRequired,
    hasUnreadActivity: PropTypes.bool.isRequired
  }

  /**
  * @return true if the current platform supports app badges
  */
  static supportsAppBadge () {
    if (process.platform === 'darwin') {
      return true
    } else if (process.platform === 'linux' && app.isUnityRunning()) {
      return true
    } else {
      return false
    }
  }

  /**
  * @return true if the app supports overlay icons
  */
  static supportsAppOverlayIcon () {
    return process.platform === 'win32'
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    if (process.platform === 'win32') {
      remote.getCurrentWindow().on('focus', this.handleWindowFocused)
    }
  }

  componentWillUnmount () {
    if (AppBadge.supportsAppBadge()) {
      app.setBadgeCount(0)
      if (process.platform === 'darwin') {
        app.dock.setBadge('')
      }
    } else if (AppBadge.supportsAppOverlayIcon()) {
      const win = remote.getCurrentWindow()
      win.setOverlayIcon(null, '')
    }

    if (process.platform === 'win32') {
      remote.getCurrentWindow().removeListener('focus', this.handleWindowFocused)
    }
  }

  /* **************************************************************************/
  // Window Events
  /* **************************************************************************/

  /**
  * Handles the window coming into focus
  */
  handleWindowFocused = () => {
    // Force a render through with the current props
    this.renderAppOverlayIcon(this.props.unreadCount, this.props.hasUnreadActivity)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders an app badge for platforms that support it
  * @param unreadCount: the unread count to render
  * @param hasUnreadActivity: true if there is unread activity
  * @return true if rendered, false otherwise
  */
  renderAppBadge (unreadCount, hasUnreadActivity) {
    if (!AppBadge.supportsAppBadge()) { return false }

    if (process.platform === 'darwin') {
      if (unreadCount > 0) {
        app.setBadgeCount(unreadCount)
        app.dock.setBadge(String(unreadCount))
      } else if (hasUnreadActivity) {
        app.setBadgeCount(0)
        app.dock.setBadge('•')
      } else {
        app.setBadgeCount(0)
        app.dock.setBadge('')
      }
    } else {
      app.setBadgeCount(unreadCount)
    }
    return true
  }

  /**
  * Renders an app overlay icon for platforms that support it
  * @param unreadCount: the unread count to render
  * @param hasUnreadActivity: true if there is unread activity
  * @return true if rendered, false otherwise
  */
  renderAppOverlayIcon (unreadCount, hasUnreadActivity) {
    if (!AppBadge.supportsAppOverlayIcon()) { return false }

    // Figure out what to show
    let text
    if (unreadCount > 0) {
      text = unreadCount.toString().length > 3 ? '+' : unreadCount.toString()
    } else if (hasUnreadActivity) {
      text = '•'
    } else {
      text = undefined
    }

    // Render
    if (text && text.length) {
      const canvas = document.createElement('canvas')
      canvas.height = 140
      canvas.width = 140

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.ellipse(70, 70, 65, 65, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.textAlign = 'center'
      ctx.fillStyle = 'white'

      if (text.length > 2) {
        ctx.font = '65px sans-serif'
        ctx.fillText(text, 70, 90)
      } else if (text.length > 1) {
        ctx.font = 'bold 80px sans-serif'
        ctx.fillText(text, 70, 97)
      } else {
        ctx.font = 'bold 100px sans-serif'
        ctx.fillText(text, 70, 106)
      }

      const badgeDataURL = canvas.toDataURL()
      const img = nativeImage.createFromDataURL(badgeDataURL)
      remote.getCurrentWindow().setOverlayIcon(img, text)
    } else {
      remote.getCurrentWindow().setOverlayIcon(null, '')
    }
    return true
  }

  render () {
    const { unreadCount, hasUnreadActivity } = this.props

    this.renderAppBadge(unreadCount, hasUnreadActivity)
    this.renderAppOverlayIcon(unreadCount, hasUnreadActivity)
    return null
  }
}

export default AppBadge
