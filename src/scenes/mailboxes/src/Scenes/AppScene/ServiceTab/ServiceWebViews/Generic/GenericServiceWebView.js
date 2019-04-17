import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebView from '../../CoreServiceWebView'
import { accountActions } from 'stores/account'
import GenericServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/GenericServiceDataReducer'
import GenericServiceReducer from 'shared/AltStores/Account/ServiceReducers/GenericServiceReducer'
import shallowCompare from 'react-addons-shallow-compare'
import { WB_BROWSER_NOTIFICATION_PRESENT } from 'shared/ipcEvents'

export default class GenericServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.webviewRef = React.createRef()
  }

  /* **************************************************************************/
  // Browser Events : Dispatcher
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  handleIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_NOTIFICATION_PRESENT: this.handleBrowserNotificationPresented(); break
      default: break
    }
  }

  /**
  * Handles the page favicon being updated
  * @param evt: the event that fired
  */
  handleFaviconUpdated = (evt) => {
    const favicons = evt.favicons
    const serviceId = this.props.serviceId

    Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'))
          }, 1000)
          this.webviewRef.current.executeJavaScript(`
            (function () {
              try {
                return Array.from(document.head.querySelectorAll('link[rel="apple-touch-icon"]')).map((e) => e.href).filter((v) => !!v)
              } catch (ex) {
                return []
              }
            })()
          `, (touchIcons) => {
            clearTimeout(timeout)
            resolve(touchIcons)
          })
        })
      })
      .catch((ex) => Promise.resolve([]))
      .then((touchIcons) => {
        accountActions.reduceService(
          serviceId,
          GenericServiceReducer.setPageFaviconAvatar,
          favicons,
          touchIcons
        )
      })
  }

  /**
  * Handles the browser presenting a notification
  */
  handleBrowserNotificationPresented = () => {
    accountActions.reduceServiceDataIfInactive(
      this.props.serviceId,
      GenericServiceDataReducer.notificationPresented
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebView
        ref={this.webviewRef}
        mailboxId={mailboxId}
        serviceId={serviceId}
        pageFaviconUpdated={this.handleFaviconUpdated}
        ipcMessage={this.handleIPCMessage} />
    )
  }
}
