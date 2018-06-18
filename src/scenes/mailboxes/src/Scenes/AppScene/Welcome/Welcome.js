import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import WelcomeBackground from './WelcomeBackground'
import WelcomePane from './WelcomePane'

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  pane: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}

@withStyles(styles)
class Welcome extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, classes, ...passProps } = this.props

    return (
      <div className={classNames(classes.container, className)} {...passProps}>
        <WelcomeBackground className={classes.background} />
        <WelcomePane className={classes.pane} />
      </div>
    )
  }
}

export default Welcome
