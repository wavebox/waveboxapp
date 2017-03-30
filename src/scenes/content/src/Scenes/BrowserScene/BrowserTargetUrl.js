const React = require('react')
const { Paper } = require('material-ui')
const { browserStore } = require('stores/browser')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'BrowserTargetUrl',

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
      url: browserState.targetUrl
    }
  },

  browserUpdated (browserState) {
    this.setState({
      url: browserState.targetUrl
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, ...passProps } = this.props
    const { url } = this.state

    const fullClassName = [
      'ReactComponent-BrowserSceneTargetUrl',
      url ? 'active' : undefined,
      className
    ].filter((c) => !!c).join(' ')

    return (
      <Paper {...passProps} className={fullClassName}>
        {url}
      </Paper>
    )
  }
})
