const React = require('react')
const {
  Paper, IconButton, FontIcon, CircularProgress,
  Toolbar, ToolbarGroup, ToolbarTitle
} = require('material-ui')
const { browserStore, browserActions } = require('stores/browser')
const shallowCompare = require('react-addons-shallow-compare')
const { remote: { shell } } = window.nativeRequire('electron')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'BrowserToolbar',
  propTypes: {
    handleGoBack: React.PropTypes.func.isRequired,
    handleGoForward: React.PropTypes.func.isRequired,
    handleStop: React.PropTypes.func.isRequired,
    handleReload: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)
  },

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
  },

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  getInitialState () {
    const browserState = browserStore.getState()
    return {
      isLoading: browserState.isLoading,
      currentUrl: browserState.currentUrl,
      canGoBack: browserState.canGoBack,
      canGoForward: browserState.canGoForward
    }
  },

  browserUpdated (browserState) {
    this.setState({
      isLoading: browserState.isLoading,
      currentUrl: browserState.currentUrl,
      canGoBack: browserState.canGoBack,
      canGoForward: browserState.canGoForward
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { className, handleGoBack, handleGoForward, handleStop, handleReload, ...passProps } = this.props
    const { isLoading, currentUrl, canGoBack, canGoForward } = this.state

    const fullClassName = [
      'ReactComponent-BrowserToolbar',
      className
    ].filter((c) => !!c).join(' ')

    return (
      <Paper {...passProps} className={fullClassName}>
        <Toolbar>
          <ToolbarGroup firstChild>
            <IconButton
              disabled={!canGoBack}
              onClick={handleGoBack}>
              <FontIcon className='material-icons'>arrow_back</FontIcon>
            </IconButton>
            <IconButton
              disabled={!canGoForward}
              onClick={handleGoForward}>
              <FontIcon className='material-icons'>arrow_forward</FontIcon>
            </IconButton>
            <IconButton onClick={isLoading ? handleStop : handleReload}>
              <FontIcon className='material-icons'>{isLoading ? 'close' : 'refresh'}</FontIcon>
            </IconButton>
            <CircularProgress
              size={18}
              thickness={2}
              style={{ transition: 'opacity 1s', margin: 10, opacity: isLoading ? 1 : 0 }} />
          </ToolbarGroup>
          <ToolbarGroup style={{ minWidth: 0 }}>
            <ToolbarTitle text={currentUrl} />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <IconButton
              tooltip='Find in Page'
              onClick={() => browserActions.toggleSearch()}>
              <FontIcon className='material-icons'>search</FontIcon>
            </IconButton>
            <IconButton
              tooltip='Open in Browser'
              tooltipPosition='bottom-left'
              onClick={() => shell.openExternal(currentUrl, { })}>
              <FontIcon className='material-icons'>open_in_browser</FontIcon>
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </Paper>
    )
  }
})
