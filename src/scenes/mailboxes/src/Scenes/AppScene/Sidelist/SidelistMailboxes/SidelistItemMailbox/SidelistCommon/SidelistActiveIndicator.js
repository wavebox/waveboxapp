import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { settingsStore } from 'stores/settings'
import UISettings from 'shared/Models/Settings/UISettings'

const styles = {
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
      bottom: 0
    }
  }
}

@withStyles(styles)
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
          sidebarActiveIndicator === UISettings.SIDEBAR_ACTIVE_INDICATOR.DOT ? 'dot' : undefined,
          sidebarActiveIndicator === UISettings.SIDEBAR_ACTIVE_INDICATOR.BANNER ? 'banner' : undefined,
          className
        )}
        style={{ backgroundColor: color, ...style }}
        {...passProps} />
    )
  }
}

export default SidelistActiveIndicator
