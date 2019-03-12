import PropTypes from 'prop-types'
import React from 'react'
import { browserStore, browserActions } from 'stores/browser'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import BrowserToolbarContent from 'wbui/BrowserToolbarContent'

const styles = (theme) => ({
  toolbar: {
    height: 40,
    minHeight: 40,
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.toolbar.backgroundColor')
  }
})

@withStyles(styles, { withTheme: true })
class BrowserToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    handleGoBack: PropTypes.func.isRequired,
    handleGoForward: PropTypes.func.isRequired,
    handleStop: PropTypes.func.isRequired,
    handleReload: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    handleLoadUrl: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.toolbarRef = React.createRef()
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  focusAddress = () => {
    this.toolbarRef.current.focusAddress()
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)
  }

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    const browserState = browserStore.getState()
    return {
      isLoading: browserState.isLoading,
      currentUrl: browserState.currentUrl,
      canGoBack: browserState.canGoBack,
      canGoForward: browserState.canGoForward
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      isLoading: browserState.isLoading,
      currentUrl: browserState.currentUrl,
      canGoBack: browserState.canGoBack,
      canGoForward: browserState.canGoForward
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the current page in the default browser
  * @param evt: the event that fired
  * @param url: the url to open
  */
  handleOpenInBrowser = (evt, url) => {
    WBRPCRenderer.wavebox.openExternal(url)
  }

  /**
  * Downloads the current page
  * @param evt: the event that fired
  * @param url: the url to download
  */
  handleDownload = (evt, url) => {
    this.props.handleDownload(url)
  }

  /**
  * Starts search
  * @param evt: the event that fired
  */
  handleSearch = (evt) => {
    browserActions.toggleSearch()
  }

  /**
  * Handles the address field leaving focus
  */
  handleBlurAddress = () => {
    if (window.location.hash.indexOf('keyboardtarget?browserurl=true') !== -1) {
      window.location.hash = '/'
    }
  }

  /**
  * Handles the address field going into focus
  */
  handleFocusAddress = () => {
    window.location.hash = '/keyboardtarget?browserurl=true'
  }

  /**
  * Handles the address field changing
  * @param evt: the event that fired
  * @param address: the address to load
  */
  handleChangeAddress = (evt, address) => {
    this.props.handleLoadUrl(address)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      theme,
      handleGoBack,
      handleGoForward,
      handleStop,
      handleReload,
      handleDownload,
      handleLoadUrl,
      ...passProps
    } = this.props
    const {
      isLoading,
      currentUrl,
      canGoBack,
      canGoForward
    } = this.state

    return (
      <Paper {...passProps}>
        <BrowserToolbarContent
          innerRef={this.toolbarRef}
          className={classes.toolbar}
          address={currentUrl}
          isLoading={isLoading}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          hasGoBack
          hasGoForward
          hasStopAndReload
          hasLoadingSpinner
          hasHome={false}
          hasDownload
          hasSearch
          hasOpenInBrowser
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onStop={handleStop}
          onReload={handleReload}
          onBlurAddress={this.handleBlurAddress}
          onFocusAddress={this.handleFocusAddress}
          onChangeAddress={this.handleChangeAddress}
          onSearch={this.handleSearch}
          onDownload={this.handleDownload}
          onOpenInBrowser={this.handleOpenInBrowser} />
      </Paper>
    )
  }
}

export default BrowserToolbar
