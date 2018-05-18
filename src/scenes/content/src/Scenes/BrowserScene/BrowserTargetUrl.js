import React from 'react'
import { Paper } from 'material-ui'
import { browserStore } from 'stores/browser'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'

const styles = {
  targetUrl: {
    position: 'absolute',
    bottom: -16,
    height: 16,
    maxWidth: '50%',
    right: 0,
    backgroundColor: 'white',
    zIndex: 9,
    overflow: 'hidden',
    textAlign: 'right',
    fontSize: '11px',
    lineHeight: '16px',
    paddingLeft: 3,
    paddingRight: 3,
    transitionDuration: '150ms !important',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  targetUrlActive: {
    bottom: 0
  }
}

@withStyles(styles)
class BrowserTargetUrl extends React.Component {
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
    const { className, classes, ...passProps } = this.props
    const { url } = this.state

    return (
      <Paper {...passProps} className={classNames(classes.targetUrl, url ? classes.targetUrlActive : undefined, className)}>
        {url}
      </Paper>
    )
  }
}

export default BrowserTargetUrl
