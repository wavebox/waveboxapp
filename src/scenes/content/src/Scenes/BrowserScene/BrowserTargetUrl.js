import React from 'react'
import { Paper } from 'material-ui'
import { browserStore } from 'stores/browser'

export default class BrowserTargetUrl extends React.Component {
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
      url: browserState.targetUrl
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      url: browserState.targetUrl
    })
  }

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
}
