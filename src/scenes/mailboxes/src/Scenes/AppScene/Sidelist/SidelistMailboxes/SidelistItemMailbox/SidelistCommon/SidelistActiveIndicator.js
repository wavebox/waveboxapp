import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { settingsStore } from 'stores/settings'
import UISettings from 'shared/Models/Settings/UISettings'
import ThemeTools from 'wbui/Themes/ThemeTools'

const MODE_TO_CLASS = {
  [UISettings.SIDEBAR_ACTIVE_INDICATOR.DOT]: 'dot',
  [UISettings.SIDEBAR_ACTIVE_INDICATOR.BANNER]: 'banner',
  [UISettings.SIDEBAR_ACTIVE_INDICATOR.BANNER_THEME]: 'banner theme',
  [UISettings.SIDEBAR_ACTIVE_INDICATOR.BAR]: 'bar',
  [UISettings.SIDEBAR_ACTIVE_INDICATOR.BAR_THEME]: 'bar theme'
}

const styles = (theme) => ({
  activeIndicator: {
    position: 'absolute',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',

    '&.dot': {
      width: 6,
      height: 6,
      borderRadius: '50%',

      '&.sidebar-regular': {
        left: 2,
        top: 24
      },
      '&.sidebar-compact': {
        left: 1,
        top: 21
      },
      '&.sidebar-tiny': {
        left: -2,
        top: 16
      }
    },

    '&.banner': {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      '&.theme': {
        backgroundColor: [ThemeTools.getStateValue(theme, 'wavebox.sidebar.mailbox.activeIndicator.banner', 'active'), '!important'],

        '&:before': {
          display: 'block',
          position: 'absolute',
          content: '""',
          top: 0,
          left: 0,
          bottom: 0,
          backgroundColor: ThemeTools.getStateValue(theme, 'wavebox.sidebar.mailbox.activeIndicator.bar', 'active')
        },
        '&.sidebar-regular': {
          '&:before': {
            width: 4
          }
        },
        '&.sidebar-compact': {
          '&:before': {
            width: 3
          }
        },
        '&.sidebar-tiny': {
          '&:before': {
            width: 2
          }
        },

        '&:hover': {
          backgroundColor: [ThemeTools.getStateValue(theme, 'wavebox.sidebar.mailbox.activeIndicator.banner', 'hover'), '!important'],

          '&:before': {
            backgroundColor: ThemeTools.getStateValue(theme, 'wavebox.sidebar.mailbox.activeIndicator.bar', 'hover')
          }
        }
      }
    },
    '&.bar': {
      top: 0,
      left: 0,
      bottom: 0,

      '&.theme': {
        backgroundColor: [ThemeTools.getStateValue(theme, 'wavebox.sidebar.mailbox.activeIndicator.bar', 'active'), '!important'],
        '&:hover': {
          backgroundColor: [ThemeTools.getStateValue(theme, 'wavebox.sidebar.mailbox.activeIndicator.bar', 'hover'), '!important']
        }
      },

      '&.sidebar-regular': {
        width: 4,
        borderBottomRightRadius: 4,
        borderTopRightRadius: 4
      },
      '&.sidebar-compact': {
        width: 3,
        borderBottomRightRadius: 3,
        borderTopRightRadius: 3
      },
      '&.sidebar-tiny': {
        width: 2
      }
    }
  }
})

@withStyles(styles, { withTheme: true })
class SidelistActiveIndicator extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    color: PropTypes.string.isRequired,
    sidebarSize: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    sidebarActiveIndicator: settingsStore.getState().ui.sidebarActiveIndicator
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      sidebarActiveIndicator: settingsState.ui.sidebarActiveIndicator
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      color,
      classes,
      theme,
      className,
      style,
      sidebarSize,
      ...passProps
    } = this.props
    const { sidebarActiveIndicator } = this.state
    if (sidebarActiveIndicator === UISettings.SIDEBAR_ACTIVE_INDICATOR.NONE) { return false }

    return (
      <div
        className={classNames(
          classes.activeIndicator,
          `sidebar-${sidebarSize.toLowerCase()}`,
          'WB-SidelistItemActiveIndicator',
          MODE_TO_CLASS[sidebarActiveIndicator],
          className
        )}
        style={{ backgroundColor: color, ...style }}
        {...passProps} />
    )
  }
}

export default SidelistActiveIndicator
