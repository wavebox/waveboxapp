import React from 'react'
import PropTypes from 'prop-types'
import WebView from './WebView'
import shallowCompare from 'react-addons-shallow-compare'
import uuid from 'uuid'
import { ipcRenderer } from 'electron'
import {
  WBRPC_PERMISSION_REQUESTS_CHANGED,
  WBRPC_WC_RESOLVE_PERMISSION_REQUEST
} from 'shared/WBRPCEvents'

const privPermissionRequests = Symbol('privPermissionRequests')

export default class BrowserView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...WebView.propTypes,
    searchId: PropTypes.any.isRequired,
    searchTerm: PropTypes.string,
    onPermissionRequestsChanged: PropTypes.func
  }
  static defaultProps = {
    searchId: `${Math.random()}`
  }
  static REACT_WEBVIEW_EVENTS = WebView.REACT_WEBVIEW_EVENTS
  static WEBVIEW_METHODS = [].concat(WebView.WEBVIEW_METHODS, ['getProcessMemoryInfo', 'sendWithResponse', 'getWebviewNode', 'isWebviewAttached'])

  /* **************************************************************************/
  // Class Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this[privPermissionRequests] = []
    this.webviewRef = React.createRef()

    // Expose the pass-through methods
    const self = this
    this.constructor.WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      self[m] = function (...args) {
        return self.webviewRef.current[m](...args)
      }
    })
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WBRPC_PERMISSION_REQUESTS_CHANGED, this.handlePermisionRequestsChanged)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WBRPC_PERMISSION_REQUESTS_CHANGED, this.handlePermisionRequestsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    webViewInstanceKey: uuid.v4()
  }

  /* **************************************************************************/
  // RPC Events
  /* **************************************************************************/

  handlePermisionRequestsChanged = (evt, webContentsId, pending) => {
    const webviewWC = this.webviewRef.current
      ? this.webviewRef.current.getWebContents()
      : undefined
    if (webviewWC && webviewWC.id === webContentsId) {
      this[privPermissionRequests] = pending

      if (this.props.onPermissionRequestsChanged) {
        this.props.onPermissionRequestsChanged({
          pending: pending,
          url: webviewWC.getURL()
        })
      }
    }
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * Resets the webview by effectively taking it out the dom and adding a new one
  * again. Handy if the webview has crashed and you want to restart it
  */
  reset = () => {
    this.setState({
      webViewInstanceKey: uuid.v4()
    })
  }

  /**
  * Resolves a permission request
  * @param type: the permission type
  * @param permission: the permission mode
  */
  resolvePermissionRequest = (type, permission) => {
    const webviewWC = this.webviewRef.current
      ? this.webviewRef.current.getWebContents()
      : undefined

    if (webviewWC) {
      ipcRenderer.send(WBRPC_WC_RESOLVE_PERMISSION_REQUEST, webviewWC.id, type, permission)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    // Push state down into webview on update
    const { searchTerm, searchId } = this.props

    // Search
    if (prevProps.searchTerm !== searchTerm) {
      if (searchTerm && searchTerm.length) {
        this.webviewRef.current.findInPage(searchTerm)
      } else {
        this.webviewRef.current.stopFindInPage('clearSelection')
      }
    } else if (prevProps.searchId !== searchId) {
      if (searchTerm && searchTerm.length) {
        this.webviewRef.current.findInPage(searchTerm, { findNext: true })
      }
    }
  }

  render () {
    const { ...passProps } = this.props
    const { webViewInstanceKey } = this.state
    return (
      <WebView
        {...passProps}
        ref={this.webviewRef}
        key={webViewInstanceKey} />)
  }
}
