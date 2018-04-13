import React from 'react'
import PropTypes from 'prop-types'
import BrowserView from 'sharedui/Components/BrowserView'
import { URL } from 'url'
import {
  WAVEBOX_CAPTURE_URLS,
  WAVEBOX_CAPTURE_URL_HOSTNAMES
} from 'shared/constants'
import electron from 'electron'
import pkg from 'package.json'
import { userActions } from 'stores/user'
import { mailboxActions } from 'stores/mailbox'

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
    const match = WAVEBOX_CAPTURE_URL_HOSTNAMES.find((hostname) => {
      return url.startsWith(`https://${hostname}`)
    })

    if (match) {
      const purl = new URL(url)
      switch (purl.pathname) {
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
          electron.remote.shell.openExternal(purl.searchParams.get('url'))
          return true
        case WAVEBOX_CAPTURE_URLS.ADD_MAILBOX:
          this.processAddMailbox(purl)
          return true
      }
    }
    return false
  }

  /**
  * Runs the add mailbox process from an add url
  * @param purl: the parsed url that should be processed
  */
  static processAddMailbox (purl) {
    const containerId = purl.searchParams.get('container_id')
    const container = purl.searchParams.get('container')
    const type = purl.searchParams.get('type')
    const accessMode = purl.searchParams.get('access_mode')
    if (containerId && container) {
      userActions.sideloadContainerLocally(containerId, JSON.parse(container))
    }
    if (type) {
      mailboxActions.startAddMailbox(type, accessMode)
    }
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
    const purl = new URL(url)
    purl.searchParams.set('x-wavebox-version', pkg.version)
    purl.searchParams.set('x-wavebox-channel', pkg.releaseChannel)
    purl.searchParams.set('x-wavebox-app', pkg.name)
    return purl.toString()
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
