import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, Icon } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import FAIcon from 'wbfa/FAIcon'
import ThemeTools from 'wbui/Themes/ThemeTools'

const TYPES = Object.freeze({
  RESTORE: 'RESTORE',
  MAXIMIZE: 'MAXIMIZE',
  MINIMIZE: 'MINIMIZE',
  UNFULLSCREEN: 'UNFULLSCREEN',
  CLOSE: 'CLOSE'
})
const styles = (theme) => ({
  button: {
    width: 20,
    height: 20,
    padding: 0,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    borderRadius: 2,
    '&:hover': {
      backgroundColor: ThemeTools.getStateValue(theme, 'wavebox.sidebar.windowControls.icon.backgroundColor', 'hover')
    }
  },
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.windowControls.icon.color')
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
})

@withStyles(styles, { withTheme: true })
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
        return (<FAIcon icon='falWindowRestore' className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.MAXIMIZE:
        return (<FAIcon icon='falWindowMaximize' className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.MINIMIZE:
        return (<FAIcon icon='falWindowMinimize' className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.CLOSE:
        return (<FAIcon icon='falWindowClose' className={classNames(classes.icon, classes.iconFA)} />)
      case TYPES.UNFULLSCREEN:
        return (<Icon className={classNames(classes.icon, classes.iconMI, 'material-icons')}>fullscreen_exit</Icon>)
    }
  }

  render () {
    const { type, className, classes, theme, ...passProps } = this.props

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
