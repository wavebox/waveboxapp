import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper } from '@material-ui/core'
import grey from '@material-ui/core/colors/grey'

const styles = {
  root: {
    width: '100%',
    maxWidth: 420,
    minWidth: 320,
    backgroundColor: grey[300],
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0
  }
}

@withStyles(styles)
class ServiceInfoPanel extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { children, className, classes, ...passProps } = this.props

    return (
      <Paper className={classNames(classes.root, className)} elevation={16} square {...passProps}>
        {children}
      </Paper>

    )
  }
}

export default ServiceInfoPanel
