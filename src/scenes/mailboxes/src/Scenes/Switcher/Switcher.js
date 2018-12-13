import React from 'react'
import { Dialog, DialogContent } from '@material-ui/core'
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
    backgroundColor: 'rgba(245, 245, 245, 0.95)'
  },
  dialogContent: {
    padding: '0px !important'
  },
  serviceScroller: {
    textAlign: 'center',
    overflow: 'auto',
    whiteSpace: 'nowrap',
    paddingTop: 18,
    paddingLeft: 6,
    paddingRight: 6,
    paddingBottom: 6
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
    const {
      classes
    } = this.props
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
          <div className={classes.serviceScroller}>
            {serviceIds.map((serviceId) => {
              return (
                <SwitcherService
                  key={serviceId}
                  onMouseMove={(evt) => this.setState({ selectedServiceId: serviceId })}
                  serviceId={serviceId}
                  isSelected={serviceId === selectedServiceId} />
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default Switcher
