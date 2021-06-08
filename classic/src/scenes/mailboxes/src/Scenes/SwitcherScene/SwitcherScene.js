import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import Zoom from '@material-ui/core/Zoom'
import SwitcherSceneContent from './SwitcherSceneContent'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import {
  WB_QUICK_SWITCH_NEXT,
  WB_QUICK_SWITCH_PREV,
  WB_QUICK_SWITCH_PRESENT_NEXT,
  WB_QUICK_SWITCH_PRESENT_PREV
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { accountActions } from 'stores/account'

const TRANSITION_DURATION = 50

const styles = {
  root: {
    maxWidth: '100%',
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    borderRadius: 10
  }
}

@withStyles(styles)
class SwitcherScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_QUICK_SWITCH_NEXT, this.handleIPCNext)
    ipcRenderer.on(WB_QUICK_SWITCH_PREV, this.handleIPCPrev)
    ipcRenderer.on(WB_QUICK_SWITCH_PRESENT_NEXT, this.handleIPCPresentNext)
    ipcRenderer.on(WB_QUICK_SWITCH_PRESENT_PREV, this.handleIPCPresentPrev)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_QUICK_SWITCH_NEXT, this.handleIPCNext)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_PREV, this.handleIPCPrev)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_PRESENT_NEXT, this.handleIPCPresentNext)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_PRESENT_PREV, this.handleIPCPresentPrev)
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Quick switches to the next account
  */
  handleIPCNext = (evt) => {
    window.location.hash = '/'
    accountActions.quickSwitchNextService()
  }

  /**
  * Quick switches to the prev account
  */
  handleIPCPrev = (evt) => {
    window.location.hash = '/'
    accountActions.quickSwitchPrevService()
  }

  /**
  * Launches quick switch in next mode
  */
  handleIPCPresentNext = (evt) => {
    window.location.hash = '/switcher/next'
  }

  /**
  * Launches quick switch in prev mode
  */
  handleIPCPresentPrev = (evt) => {
    window.location.hash = '/switcher/prev'
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
    const { classes, routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        transitionDuration={TRANSITION_DURATION}
        TransitionComponent={Zoom}
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider routeName={routeName} Component={SwitcherSceneContent} />
      </RouterDialog>
    )
  }
}

export default SwitcherScene
