import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import FAREyeSlashIcon from 'wbfa/FAREyeSlash'
import PropTypes from 'prop-types'

const styles = {
  contextMenuFAWrap: {
    width: 20,
    height: 20,
    fontSize: 20
  }
}

@withStyles(styles)
class SidelistControlBusyContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, onRequestClose } = this.props

    return (
      <MenuItem
        onClick={(evt) => {
          onRequestClose(evt, () => { settingsActions.sub.ui.setShowSidebarBusy(false) })
        }}>
        <ListItemIcon>
          <span className={classes.contextMenuFAWrap}>
            <FAREyeSlashIcon />
          </span>
        </ListItemIcon>
        <ListItemText inset primary='Hide Activity Indicator' />
      </MenuItem>
    )
  }
}

export default SidelistControlBusyContextMenu
