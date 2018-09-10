import React from 'react'
import PropTypes from 'prop-types'
import BrowserView from 'wbui/Guest/BrowserView'
import { URL } from 'url'
import {
  WAVEBOX_CAPTURE_URLS,
  WAVEBOX_CAPTURE_URL_HOSTNAMES
} from 'shared/constants'
import electron from 'electron'
import pkg from 'package.json'
import WaveboxWebViewLoadbar from './WaveboxWebViewLoadbar'
import WaveboxWebViewToolbar from './WaveboxWebViewToolbar'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const BROWSER_VIEW_PASS_PROPS = new Set(BrowserView.REACT_WEBVIEW_EVENTS)
const REF = 'webview'

const styles = {
  webviewContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  webviewContainerWithToolbar: {
    top: 40
  }
}

@withStyles(styles)
class WaveboxWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...BrowserView.PropTypes,
    saltClientInfoInUrl: PropTypes.bool.isRequired,
    hasToolbar: PropTypes.bool.isRequired,
    hasLoadbar: PropTypes.bool.isRequired
  }

  static defaultProps = {
    saltClientInfoInUrl: true,
    hasToolbar: false,
    hasLoadbar: true
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
      }
    }
    return false
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    isLoading: true,
    pageTitle: '',
    canGoBack: false,
    canGoForward: false
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
  // UI Events
  /* **************************************************************************/

  handleGoBack = () => {
    this.refs[REF].goBack()
  }

  handleGoForward = () => {
    this.refs[REF].goForward()
  }

  handleStop = () => {
    this.refs[REF].stop()
  }

  handleReload = () => {
    this.refs[REF].reload()
  }

  /* **************************************************************************/
  // Webview Events
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
  handleDomReady = (...args) => {
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
    if (this.props.domReady) { this.props.domReady(...args) }
  }

  /**
  * Handles the page title being updated
  * @param evt: the event that fired
  */
  handlePageTitleUpdated = (...args) => {
    const [evt] = args
    this.setState({ pageTitle: evt.title })

    if (this.props.pageTitleUpdated) { this.props.pageTitleUpdated(...args) }
  }

  /**
  * Handles the page starting to load
  * @param evt: the event that fired
  */
  handleDidStartLoading = (...args) => {
    this.setState({ isLoading: true })

    if (this.props.didStartLoading) { this.props.didStartLoading(...args) }
  }

  /**
  * Handles the page stop loading
  * @param evt: the event that fired
  */
  handleDidStopLoading = (...args) => {
    this.setState({ isLoading: false })

    if (this.props.didStopLoading) { this.props.didStopLoading(...args) }
  }

  /**
  * Handles the page beginning to navigate
  * @param evt: the event that fired
  */
  handleWillNavigate = (...args) => {
    this.setState({
      canGoBack: this.refs[REF].canGoBack(),
      canGoForward: this.refs[REF].canGoForward()
    })

    if (this.props.willNavigate) { this.props.willNavigate(...args) }
  }

  /**
  * Handles the page commiting navigation
  * @param evt: the event that fired
  */
  handleDidNavigate = (...args) => {
    this.setState({
      canGoBack: this.refs[REF].canGoBack(),
      canGoForward: this.refs[REF].canGoForward()
    })

    if (this.props.didNavigate) { this.props.didNavigate(...args) }
  }

  /**
  * Handles the page navigating in page
  * @param evt: the event that fired
  */
  handleDidNavigateInPage = (...args) => {
    this.setState({
      canGoBack: this.refs[REF].canGoBack(),
      canGoForward: this.refs[REF].canGoForward()
    })

    if (this.props.didNavigateInPage) { this.props.didNavigateInPage(...args) }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      src,
      saltClientInfoInUrl,
      hasToolbar,
      hasLoadbar,
      classes,
      ...allPP
    } = this.props
    const { browserViewPP, rootPP } = Object.keys(allPP).reduce((acc, k) => {
      if (BROWSER_VIEW_PASS_PROPS.has(k)) {
        acc.browserViewPP[k] = allPP[k]
      } else {
        acc.rootPP[k] = allPP[k]
      }
      return acc
    }, { browserViewPP: {}, rootPP: {} })

    const {
      isLoading,
      pageTitle,
      canGoBack,
      canGoForward
    } = this.state

    return (
      <div {...rootPP}>
        {hasToolbar ? (
          <WaveboxWebViewToolbar
            handleGoBack={this.handleGoBack}
            handleGoForward={this.handleGoForward}
            handleStop={this.handleStop}
            handleReload={this.handleReload}
            isLoading={isLoading}
            pageTitle={pageTitle}
            canGoBack={canGoBack}
            canGoForward={canGoForward} />
        ) : undefined}
        <div className={classNames(classes.webviewContainer, hasToolbar ? classes.webviewContainerWithToolbar : undefined)}>
          {hasLoadbar ? (
            <WaveboxWebViewLoadbar isLoading={isLoading} />
          ) : undefined}
          <BrowserView
            ref={REF}
            src={saltClientInfoInUrl ? this.saltUrlWithClientInfo(src) : src}
            webpreferences='contextIsolation=yes'

            // Overwritable - don't call up into parent
            newWindow={this.handleOpenNewWindow}
            {...browserViewPP}

            // Composite - will also call up if parent passes in
            domReady={this.handleDomReady}
            pageTitleUpdated={this.handlePageTitleUpdated}
            didStartLoading={this.handleDidStartLoading}
            didStopLoading={this.handleDidStopLoading}
            willNavigate={this.handleWillNavigate}
            didNavigate={this.handleDidNavigate}
            didNavigateInPage={this.handleDidNavigateInPage} />
        </div>
      </div>
    )
  }
}

export default WaveboxWebView
