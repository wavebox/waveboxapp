import React from 'react'
import { settingsStore, settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { UISettings } from 'shared/Models/Settings'
import { withStyles } from '@material-ui/core/styles'
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import FAREyeSlashIcon from 'wbfa/FAREyeSlash'
import FAREyeIcon from 'wbfa/FAREye'
import PropTypes from 'prop-types'

const styles = {
  contextMenuFAWrap: {
    width: 20,
    height: 20,
    fontSize: 20
  }
}

@withStyles(styles)
class SidelistControlWhatsNewContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return { showMode: settingsState.ui.showSidebarNewsfeed }
  })()

  settingsChanged = (settingsState) => {
    this.setState({ showMode: settingsState.ui.showSidebarNewsfeed })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, onRequestClose } = this.props
    const { showMode } = this.state

    return (
      <span>
        {showMode !== UISettings.SIDEBAR_NEWS_MODES.NEVER ? (
          <MenuItem
            onClick={(evt) => {
              onRequestClose(evt, () => {
                settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.NEVER)
              })
            }}>
            <ListItemIcon>
              <span className={classes.contextMenuFAWrap}>
                <FAREyeSlashIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Hide What's New`} />
          </MenuItem>
        ) : undefined}
        {showMode !== UISettings.SIDEBAR_NEWS_MODES.UNREAD ? (
          <MenuItem
            onClick={(evt) => {
              onRequestClose(evt, () => {
                settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.UNREAD)
              })
            }}>
            <ListItemIcon>
              <span className={classes.contextMenuFAWrap}>
                <FAREyeIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Only show when there are new items`} />
          </MenuItem>
        ) : undefined}
        {showMode !== UISettings.SIDEBAR_NEWS_MODES.ALWAYS ? (
          <MenuItem
            onClick={(evt) => {
              onRequestClose(evt, () => {
                settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.ALWAYS)
              })
            }}>
            <ListItemIcon>
              <span className={classes.contextMenuFAWrap}>
                <FAREyeIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Always show What's New`} />
          </MenuItem>
        ) : undefined}
      </span>
    )
  }
}

export default SidelistControlWhatsNewContextMenu
