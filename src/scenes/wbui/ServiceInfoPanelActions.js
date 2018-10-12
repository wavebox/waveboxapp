import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    position: 'absolute',
    textAlign: 'center',
    left: 0,
    bottom: 0,
    right: 0,
    height: 0,
    paddingLeft: 30,
    paddingRight: 30,

    '&.actions-1': { height: 48 },
    '&.actions-2': { height: 90 },
    '&.actions-3': { height: 135 }
  }
}

@withStyles(styles)
class ServiceInfoPanelActions extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    actions: PropTypes.oneOf([1, 2, 3]).isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { children, className, classes, actions, ...passProps } = this.props

    return (
      <div className={classNames(className, classes.root, `actions-${actions}`)} {...passProps}>
        {children}
      </div>
    )
  }
}

export default ServiceInfoPanelActions
