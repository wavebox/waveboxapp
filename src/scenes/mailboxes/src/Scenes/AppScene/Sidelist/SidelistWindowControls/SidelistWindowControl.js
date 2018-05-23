import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Icon } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import blueGrey from '@material-ui/core/colors/blueGrey'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import falWindowRestore from '@fortawesome/fontawesome-pro-light/faWindowRestore'
import falWindowMaximize from '@fortawesome/fontawesome-pro-light/faWindowMaximize'
import falWindowMinimize from '@fortawesome/fontawesome-pro-light/faWindowMinimize'
import falWindowClose from '@fortawesome/fontawesome-pro-light/faWindowClose'

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
        return (<FontAwesomeIcon icon={falWindowRestore} className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.MAXIMIZE:
        return (<FontAwesomeIcon icon={falWindowMaximize} className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.MINIMIZE:
        return (<FontAwesomeIcon icon={falWindowMinimize} className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.CLOSE:
        return (<FontAwesomeIcon icon={falWindowClose} className={classNames(classes.icon, classes.iconFA)} />)
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
