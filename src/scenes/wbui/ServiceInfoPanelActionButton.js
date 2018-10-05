import React from 'react'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    margin: 4,
    width: '100%'
  }
}

@withStyles(styles)
class ServiceInfoActionButton extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { children, className, classes, ...passProps } = this.props

    return (
      <Button className={classNames(className, classes.root)} {...passProps}>
        {children}
      </Button>
    )
  }
}

export default ServiceInfoActionButton
