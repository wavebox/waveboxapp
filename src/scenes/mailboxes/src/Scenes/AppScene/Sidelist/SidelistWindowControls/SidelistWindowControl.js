import React from 'react'
import PropTypes from 'prop-types'
import { IconButton } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ThemeTools from 'wbui/Themes/ThemeTools'
import UISettings from 'shared/Models/Settings/UISettings'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
import FASWindowRestoreIcon from 'wbfa/FASWindowRestore'
import FALWindowRestoreIcon from 'wbfa/FALWindowRestore'
import FASWindowMaximizeIcon from 'wbfa/FASWindowMaximize'
import FALWindowMaximizeIcon from 'wbfa/FALWindowMaximize'
import FASWindowMinimizeIcon from 'wbfa/FASWindowMinimize'
import FALWindowMinimizeIcon from 'wbfa/FALWindowMinimize'
import FASWindowCloseIcon from 'wbfa/FASWindowClose'
import FALWindowCloseIcon from 'wbfa/FALWindowClose'

const TYPES = Object.freeze({
  RESTORE: 'RESTORE',
  MAXIMIZE: 'MAXIMIZE',
  MINIMIZE: 'MINIMIZE',
  UNFULLSCREEN: 'UNFULLSCREEN',
  CLOSE: 'CLOSE'
})

const styles = (theme) => ({
  button: {
    padding: 0,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    '&.sidebar-regular': {
      width: 20,
      height: 20,
      borderRadius: 2,

      '& .iconFA': {
        fontSize: 14,
        lineHeight: '14px'
      },
      '& .iconMI': {
        fontSize: 19,
        lineHeight: '14px'
      }
    },
    '&.sidebar-compact': {
      width: 16,
      height: 16,
      borderRadius: 2,

      '& .iconFA': {
        fontSize: 14,
        lineHeight: '14px'
      },
      '& .iconMI': {
        fontSize: 19,
        lineHeight: '14px',
        marginTop: -1
      }
    },
    '&.sidebar-tiny': {
      width: 12,
      height: 12,
      borderRadius: 0,

      '& .iconFA': {
        fontSize: 11,
        lineHeight: '12px'
      },
      '& .iconMI': {
        fontSize: 13,
        lineHeight: '13px'
      }
    },
    '&:hover': {
      backgroundColor: ThemeTools.getStateValue(theme, 'wavebox.sidebar.windowControls.icon.backgroundColor', 'hover')
    },

    '& .icon': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.windowControls.icon.color')
    }
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
    type: PropTypes.oneOf(Object.keys(TYPES)).isRequired,
    sidebarSize: PropTypes.oneOf(Object.keys(UISettings.SIDEBAR_SIZES)).isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the icon for the given type
  * @param classes: the classes to use
  * @param type: the type to render
  * @param sidebarSize: the size of the sidebar
  * @return jsx
  */
  renderIconForType (classes, type, sidebarSize) {
    switch (type) {
      case TYPES.RESTORE:
        return UISettings.SIDEBAR_SIZES.TINY
          ? <FASWindowRestoreIcon className='icon iconFA' />
          : <FALWindowRestoreIcon className='icon iconFA' />
      case TYPES.MAXIMIZE:
        return UISettings.SIDEBAR_SIZES.TINY
          ? <FASWindowMaximizeIcon className='icon iconFA' />
          : <FALWindowMaximizeIcon className='icon iconFA' />
      case TYPES.MINIMIZE:
        return UISettings.SIDEBAR_SIZES.TINY
          ? <FASWindowMinimizeIcon className='icon iconFA' />
          : <FALWindowMinimizeIcon className='icon iconFA' />
      case TYPES.CLOSE:
        return UISettings.SIDEBAR_SIZES.TINY
          ? <FASWindowCloseIcon className='icon iconFA' />
          : <FALWindowCloseIcon className='icon iconFA' />
      case TYPES.UNFULLSCREEN:
        return (
          <FullscreenExitIcon
            className='icon iconMI' />
        )
    }
  }

  render () {
    const {
      type,
      className,
      sidebarSize,
      classes,
      theme,
      ...passProps
    } = this.props

    return (
      <IconButton
        className={classNames(classes.button, className, `sidebar-${sidebarSize.toLowerCase()}`)}
        {...passProps}>
        {this.renderIconForType(classes, type, sidebarSize)}
      </IconButton>
    )
  }
}

export default SidelistWindowControl
