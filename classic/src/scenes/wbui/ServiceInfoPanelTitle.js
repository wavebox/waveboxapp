import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  }
}

@withStyles(styles)
class ServiceInfoPanelTitle extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { children, className, classes, ...passProps } = this.props

    return (
      <h1 className={classNames(className, classes.root)} {...passProps}>
        {children}
      </h1>
    )
  }
}

export default ServiceInfoPanelTitle
