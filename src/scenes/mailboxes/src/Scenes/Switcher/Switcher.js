import React from 'react'
import PropTypes from 'prop-types'
import { Button, Dialog, DialogContent, DialogActions } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { accountStore, accountActions } from 'stores/account'
import Zoom from '@material-ui/core/Zoom'
import { ipcRenderer } from 'electron'
import SwitcherService from './SwitcherService'
import {
  WB_MAILBOXES_QUICK_SWITCH_NEXT,
  WB_MAILBOXES_QUICK_SWITCH_SELECT
} from 'shared/ipcEvents'

const TRANSITION_DURATION = 50

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  }
}

@withStyles(styles)
class Switcher extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    window.addEventListener('blur', this.handleClose)
    ipcRenderer.on(WB_MAILBOXES_QUICK_SWITCH_NEXT, this.ipcHandleNext)
    ipcRenderer.on(WB_MAILBOXES_QUICK_SWITCH_SELECT, this.ipcHandleSelect)
  }

  componentWillUnmount () {
    window.removeEventListener('blur', this.handleClose)
    ipcRenderer.removeListener(WB_MAILBOXES_QUICK_SWITCH_NEXT, this.ipcHandleNext)
    ipcRenderer.removeListener(WB_MAILBOXES_QUICK_SWITCH_SELECT, this.ipcHandleSelect)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    //TODO handle 1 service
    //TODO respond to arrows
    const accountState = accountStore.getState()
    const serviceIds = accountState.lastAccessedServiceIds()
    const activeServiceId = accountState.activeServiceId()
    const selectedIndex = serviceIds.findIndex((serviceId) => {
      return serviceId === activeServiceId
    })

    return {
      open: true,
      serviceIds: serviceIds, // Purposefully don't update these to help with jank
      selectedServiceId: serviceIds[selectedIndex + 1] || serviceIds[0]
    }
  })()

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles the ipc channel indicating to select the next service
  */
  ipcHandleNext = () => {
    this.setState((prevState) => {
      const { serviceIds, selectedServiceId } = prevState
      const selectedIndex = serviceIds.findIndex((serviceId) => {
        return serviceId === selectedServiceId
      })

      return {
        selectedServiceId: serviceIds[selectedIndex + 1] || serviceIds[0]
      }
    })
  }

  /**
  * Handles the ipc channel indicating to switch to the service
  */
  ipcHandleSelect = () => {
    const { selectedServiceId } = this.state
    accountActions.changeActiveService(selectedServiceId)
    this.handleClose()
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState((prevState) => {
      if (prevState.open) {
        setTimeout(() => {
          window.location.hash = '/'
        }, TRANSITION_DURATION + 50)
        return { open: false }
      } else {
        return undefined
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    //const { classes } = this.props
    const classes = {}
    const {
      open,
      serviceIds,
      selectedServiceId
    } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        hideBackdrop
        transitionDuration={TRANSITION_DURATION}
        TransitionComponent={Zoom}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          {serviceIds.map((serviceId) => {
            return (
              <SwitcherService
                key={serviceId}
                serviceId={serviceId}
                style={{backgroundColor: serviceId === selectedServiceId ? 'red' : 'transparent'}} />
            )
          })}
        </DialogContent>
      </Dialog>
    )
  }
}

export default Switcher
