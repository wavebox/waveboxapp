import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'
import StyleMixins from './Styles/StyleMixins'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    paddingLeft: 24,
    paddingRight: 24,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars,

    '&.actions-1': { bottom: 48 },
    '&.actions-2': { bottom: 90 },
    '&.actions-3': { bottom: 135 }
  }
}

@withStyles(styles)
class ServiceInfoPanelBody extends React.Component {
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

export default ServiceInfoPanelBody
