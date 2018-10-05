import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
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
      <div className={classNames(classes.root, className)} {...passProps}>
        {children}
      </div>
    )
  }
}

export default ServiceInfoPanel
