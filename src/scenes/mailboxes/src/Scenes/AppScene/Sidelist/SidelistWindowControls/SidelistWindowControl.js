import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Icon } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import blueGrey from '@material-ui/core/colors/blueGrey'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const TYPES = Object.freeze({
  RESTORE: 'RESTORE',
  MAXIMIZE: 'MAXIMIZE',
  MINIMIZE: 'MINIMIZE',
  UNFULLSCREEN: 'UNFULLSCREEN',
  CLOSE: 'CLOSE'
})
const styles = {
  button: {
    width: 20,
    height: 20,
    padding: 0,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    borderRadius: 2,
    '&:hover': {
      backgroundColor: blueGrey[700]
    }
  },
  icon: {
    color: blueGrey[50]
  },
  iconFA: {
    fontSize: 14,
    lineHeight: '14px'
  },
  iconMI: {
    fontSize: 19,
    lineHeight: '14px',
    top: 3
  }
}

@withStyles(styles)
class SidelistWindowControl extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static TYPES = TYPES
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    type: PropTypes.oneOf(Object.keys(TYPES)).isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the icon for the given type
  * @param type: the type to render
  * @return jsx
  */
  renderIconForType (classes, type) {
    switch (type) {
      case TYPES.RESTORE:
        return (<Icon className={classNames(classes.icon, classes.iconFA, 'fal fa-fw fa-window-restore')} />)
      case TYPES.MAXIMIZE:
        return (<Icon className={classNames(classes.icon, classes.iconFA, 'fal fa-fw fa-window-maximize')} />)
      case TYPES.MINIMIZE:
        return (<Icon className={classNames(classes.icon, classes.iconFA, 'fal fa-fw fa-window-minimize')} />)
      case TYPES.CLOSE:
        return (<Icon className={classNames(classes.icon, classes.iconFA, 'fal fa-fw fa-window-close')} />)
      case TYPES.UNFULLSCREEN:
        return (<Icon className={classNames(classes.icon, classes.iconMI, 'material-icons')}>fullscreen_exit</Icon>)
    }
  }

  render () {
    const { type, className, classes, ...passProps } = this.props

    return (
      <IconButton
        {...passProps}
        className={classNames(classes.button, className)}>
        {this.renderIconForType(classes, type)}
      </IconButton>
    )
  }
}

export default SidelistWindowControl
