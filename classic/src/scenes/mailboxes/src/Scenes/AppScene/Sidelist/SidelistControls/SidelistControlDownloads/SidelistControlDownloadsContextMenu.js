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
class SidelistControlDownloadsContextMenu extends React.Component {
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
    return { showMode: settingsState.ui.showSidebarDownloads }
  })()

  settingsChanged = (settingsState) => {
    this.setState({ showMode: settingsState.ui.showSidebarDownloads })
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
        {showMode !== UISettings.SIDEBAR_DOWNLOAD_MODES.NEVER ? (
          <MenuItem
            onClick={(evt) => {
              onRequestClose(evt, () => {
                settingsActions.sub.ui.setShowSidebarDownloads(UISettings.SIDEBAR_DOWNLOAD_MODES.NEVER)
              })
            }}>
            <ListItemIcon>
              <span className={classes.contextMenuFAWrap}>
                <FAREyeSlashIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Hide Downloads`} />
          </MenuItem>
        ) : undefined}
        {showMode !== UISettings.SIDEBAR_DOWNLOAD_MODES.UNREAD ? (
          <MenuItem
            onClick={(evt) => {
              onRequestClose(evt, () => {
                settingsActions.sub.ui.setShowSidebarDownloads(UISettings.SIDEBAR_DOWNLOAD_MODES.ACTIVE)
              })
            }}>
            <ListItemIcon>
              <span className={classes.contextMenuFAWrap}>
                <FAREyeIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Only show when there are active downloads`} />
          </MenuItem>
        ) : undefined}
        {showMode !== UISettings.SIDEBAR_DOWNLOAD_MODES.ALWAYS ? (
          <MenuItem
            onClick={(evt) => {
              onRequestClose(evt, () => {
                settingsActions.sub.ui.setShowSidebarDownloads(UISettings.SIDEBAR_DOWNLOAD_MODES.ALWAYS)
              })
            }}>
            <ListItemIcon>
              <span className={classes.contextMenuFAWrap}>
                <FAREyeIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Always show Downloads`} />
          </MenuItem>
        ) : undefined}
      </span>
    )
  }
}

export default SidelistControlDownloadsContextMenu
