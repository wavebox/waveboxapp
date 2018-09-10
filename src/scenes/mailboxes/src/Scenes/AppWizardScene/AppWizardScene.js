import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Button, Dialog, DialogContent, DialogActions } from '@material-ui/core'
import { settingsActions } from 'stores/settings'
import { platformStore } from 'stores/platform'
import { Redirect } from 'react-router-dom'
import AppWizardIntroScene from './AppWizardIntroScene'
import AppWizardTrayScene from './AppWizardTrayScene'
import AppWizardMailtoScene from './AppWizardMailtoScene'
import AppWizardCompleteScene from './AppWizardCompleteScene'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative',
    backgroundColor: 'rgb(242, 242, 242)'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    margin: 0,
    padding: '8px 4px'
  },
  modalActionExtraButton: {
    marginRight: 8
  },
  modalActionButtonSpacer: {
    flex: 1
  }
}

@withStyles(styles)
class AppWizardScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        step: PropTypes.string
      })
    })
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles the user cancelling the wizard
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /**
  * Handles the user pressing next
  */
  handleNext = () => {
    const step = this.props.match.params.step
    if (!step) {
      window.location.hash = '/app_wizard/tray'
    } else if (step === 'tray') {
      if (platformStore.getState().mailtoLinkHandlerSupported()) {
        window.location.hash = '/app_wizard/mailto'
      } else {
        window.location.hash = '/app_wizard/finish'
      }
    } else if (step === 'mailto') {
      window.location.hash = '/app_wizard/finish'
    }
  }

  /**
  * Handles the user electing not to do the wizard
  */
  handleNever = () => {
    settingsActions.sub.app.setHasSeenAppWizard(true)
    settingsActions.tourNextIfActive()
    this.handleClose()
  }

  /**
  * Handles the user finishing the wizard
  */
  handleFinish = () => {
    settingsActions.sub.app.setHasSeenAppWizard(true)
    settingsActions.tourNextIfActive()
    this.handleClose()
  }

  /**
  * Handles the user finish the wizard and continuing to settings
  */
  handleFinishSettings = () => {
    settingsActions.sub.app.setHasSeenAppWizard(true)
    settingsActions.tourNextIfActive()
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/settings'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the actions
  * @param classes
  * @param step: the current step
  * @return jsx
  */
  renderActions (classes, step) {
    if (!step) {
      return (
        <DialogActions className={classes.dialogActions}>
          <Button onClick={this.handleNever}>
            Not interested
          </Button>
          <div className={classes.modalActionButtonSpacer} />
          <Button className={classes.modalActionExtraButton} onClick={this.handleClose}>
            Later
          </Button>
          <Button variant='raised' color='primary' onClick={this.handleNext}>
            Start
          </Button>
        </DialogActions>
      )
    } else if (step === 'tray' || step === 'mailto') {
      return (
        <DialogActions className={classes.dialogActions}>
          <Button className={classes.modalActionExtraButton} onClick={this.handleClose}>
            Cancel
          </Button>
          <Button variant='raised' color='primary' onClick={this.handleNext}>
            Next
          </Button>
        </DialogActions>
      )
    } else if (step === 'finish') {
      return (
        <DialogActions className={classes.dialogActions}>
          <Button className={classes.modalActionExtraButton} onClick={this.handleFinishSettings}>
            More Settings
          </Button>
          <Button variant='raised' color='primary' onClick={this.handleFinish}>
            Finish
          </Button>
        </DialogActions>
      )
    } else {
      return undefined
    }
  }

  /**
  * Renders the actions
  * @param classes:
  * @param step: the current step
  * @return jsx
  */
  renderContent (classes, step) {
    if (!step) {
      return (<AppWizardIntroScene />)
    } else if (step === 'tray') {
      return (<AppWizardTrayScene />)
    } else if (step === 'mailto') {
      return (<AppWizardMailtoScene onRequestNext={this.handleNext} />)
    } else if (step === 'finish') {
      return (<AppWizardCompleteScene />)
    } else {
      return undefined
    }
  }

  render () {
    const { open } = this.state
    const { match, classes } = this.props
    const step = match.params.step

    if (step === 'start') {
      return (<Redirect to='/app_wizard/tray' />)
    }

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          {this.renderContent(classes, step)}
        </DialogContent>
        {this.renderActions(classes, step)}
      </Dialog>
    )
  }
}

export default AppWizardScene
