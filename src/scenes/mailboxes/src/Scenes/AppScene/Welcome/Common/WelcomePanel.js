import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Paper } from '@material-ui/core'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflowY: 'auto',
    zIndex: 4
  },
  panel: {
    minWidth: 700,
    maxWidth: 850
  }
}

@withStyles(styles)
class WelcomePanel extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    paperClassName: PropTypes.string,
    paperStyle: PropTypes.object
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      className,
      classes,
      children,
      paperClassName,
      paperStyle,
      ...passProps
    } = this.props

    return (
      <div className={classNames(classes.root, className)} {...passProps}>
        <Paper className={classNames(classes.panel, paperClassName)} style={paperStyle} elevation={10}>
          {children}
        </Paper>
      </div>
    )
  }
}

export default WelcomePanel
