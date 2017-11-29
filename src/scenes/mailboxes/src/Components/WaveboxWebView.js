import React from 'react'
import PropTypes from 'prop-types'
import BrowserView from 'sharedui/Components/BrowserView'
import URI from 'urijs'
import {
  WAVEBOX_CAPTURE_URLS,
  WAVEBOX_CAPTURE_URL_HOSTNAMES
} from 'shared/constants'
import electron from 'electron'
import pkg from 'package.json'

const REF = 'webview'

export default class WaveboxWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...BrowserView.PropTypes,
    saltClientInfoInUrl: PropTypes.bool.isRequired
  }

  static defaultProps = {
    saltClientInfoInUrl: true
  }

  /**
  * Routes a url for specified actions
  * @param url: the url to route
  * @return true if the url was routed, false otherwise
  */
  static routeWaveboxUrl (url) {
    const purl = URI(url)
    if (WAVEBOX_CAPTURE_URL_HOSTNAMES.indexOf(purl.hostname()) !== -1) {
      switch (purl.pathname()) {
        case WAVEBOX_CAPTURE_URLS.SETTINGS:
          window.location.hash = '/settings'
          return true
        case WAVEBOX_CAPTURE_URLS.SETTINGS_PRO:
          window.location.hash = '/settings/pro'
          return true
        case WAVEBOX_CAPTURE_URLS.HOME:
          window.location.hash = '/'
          return true
        case WAVEBOX_CAPTURE_URLS.WAVEBOX_AUTH:
          window.location.hash = '/account/auth'
          return true
        case WAVEBOX_CAPTURE_URLS.WAVEBOX_AUTH_PAYMENT:
          window.location.hash = '/account/auth/payment'
          return true
        case WAVEBOX_CAPTURE_URLS.WAVEBOX_AUTH_AFFILIATE:
          window.location.hash = '/account/auth/affiliate'
          return true
        case WAVEBOX_CAPTURE_URLS.WAVEBOX_PRO_BUY:
          window.location.hash = '/'
          electron.remote.shell.openExternal(purl.search(true).url)
          return true
      }
    }
    return false
  }

  /* **************************************************************************/
  // Routing & Urls
  /* **************************************************************************/

  /**
  * Salts the client info into the given url
  * @param url: the url to salt into
  * @return a url with querystring arguments salted
  */
  saltUrlWithClientInfo (url) {
    return URI(url).addSearch({
      'x-wavebox-version': pkg.version,
      'x-wavebox-channel': pkg.releaseChannel,
      'x-wavebox-app': pkg.name
    }).toString()
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Opens a new window in the browser
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const handled = WaveboxWebView.routeWaveboxUrl(evt.url)
    if (!handled) {
      electron.remote.shell.openExternal(evt.url)
    }
  }

  /**
  * Handles the dom being ready by updating it with anything
  * @param evt: the event that fired
  */
  handleDomReady = (evt) => {
    this.refs[REF].getWebviewNode().insertCSS(`
      body::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 7px;
        height: 7px;
      }
      body::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(0,0,0,.5);
        -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
      }
    `)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { src, saltClientInfoInUrl, ...passProps } = this.props

    return (
      <BrowserView
        ref={REF}
        src={saltClientInfoInUrl ? this.saltUrlWithClientInfo(src) : src}
        webpreferences='contextIsolation=yes'
        newWindow={this.handleOpenNewWindow}
        domReady={this.handleDomReady}
        {...passProps} />
    )
  }
}
