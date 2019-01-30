import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import Zoom from '@material-ui/core/Zoom'
import { RouterDialog } from 'wbui/RouterDialog'
import CommandPaletteSceneContent from './CommandPaletteSceneContent'
import { withStyles } from '@material-ui/core/styles'
import { ipcRenderer } from 'electron'
import {
  WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE
} from 'shared/ipcEvents'

const TRANSITION_DURATION = 50

const styles = {
  root: {
    height: '100%',
    minWidth: 600,
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    borderRadius: 10
  }
}

@withStyles(styles)
class CommandPaletteScene extends React.Component {
  /* **************************************************************************/
  // PropTypes
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE, this.handleIPCToggle)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE, this.handleIPCToggle)
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Quick switches to the next account
  */
  handleIPCToggle = (evt) => {
    window.location.hash = window.location.hash === '#/command' || window.location.hash.startsWith('#/command/')
      ? ''
      : '/command'
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { routeName, classes } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        transitionDuration={TRANSITION_DURATION}
        TransitionComponent={Zoom}
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <CommandPaletteSceneContent />
      </RouterDialog>
    )
  }
}

export default CommandPaletteScene
