import React from 'react'
import BrowserView from 'sharedui/Components/BrowserView'
import URI from 'urijs'
const { remote: {shell} } = window.nativeRequire('electron')

const REF = 'webview'

export default class WaveboxWebView extends React.Component {
  /* **************************************************************************/
  // Routing
  /* **************************************************************************/

  /**
  * Routes a url for specified actions
  * @param url: the url to route
  * @return true if the url was routed, false otherwise
  */
  routeUrl (url) {
    const purl = URI(url)
    if (purl.hostname() === 'wavebox.io') {
      switch (purl.pathname()) {
        case '/app/redirect/settings':
          window.location.hash = '/settings'
          return true
        case '/app/redirect/settings/pro':
          window.location.hash = '/settings/pro'
          return true
        case '/app/redirect/home':
          window.location.hash = '/'
          return true
        case '/app/redirect/waveboxauth':
          window.location.hash = '/account/auth'
          return true
        case '/app/redirect/waveboxauth/payment':
          window.location.hash = '/account/auth/payment'
          return true
        case '/app/redirect/waveboxauth/affiliate':
          window.location.hash = '/account/auth/affiliate'
          return true
        case '/app/redirect/pro/buy':
          window.location.hash = '/'
          shell.openExternal(purl.search(true).url)
          return true
      }
    }
    return false
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Opens a new window in the browser
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const didRoute = this.routeUrl(evt.url)
    if (!didRoute) {
      shell.openExternal(evt.url)
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
    // Set ...props after our props in case we want to overwrite in the future...
    return (
      <BrowserView
        ref={REF}
        webpreferences='contextIsolation=yes'
        newWindow={this.handleOpenNewWindow}
        domReady={this.handleDomReady}
        {...this.props} />
    )
  }
}
