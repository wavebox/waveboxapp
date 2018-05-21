import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxWizardStepper from './MailboxWizardStepper'
import { Dialog, DialogContent } from '@material-ui/core'
import MailboxTypes from 'shared/Models/Accounts/MailboxTypes'
import MailboxFactory from 'shared/Models/Accounts/MailboxFactory'
import WizardPersonalise from './WizardPersonalise'
import WizardAuth from './WizardAuth'
import WizardConfigure from './WizardConfigure'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%',
    minWidth: 580
  },
  dialogContent: {
    position: 'relative',
    backgroundColor: 'rgb(242, 242, 242)'
  },
  master: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 150
  },
  detail: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 150
  }
}

@withStyles(styles)
class MailboxWizardScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxType: PropTypes.oneOf(Object.keys(MailboxTypes)).isRequired,
        accessMode: PropTypes.string.isRequired,
        step: PropTypes.string.isRequired,
        mailboxId: PropTypes.string
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
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the current step
  * @param classes
  * @param currentStep: the step to render
  * @param mailboxType: the mailbox type
  * @param accessMode: the access mode to use when creating the mailbox
  * @param mailboxId: the id of the mailbox
  * @return jsx
  */
  renderStep (classes, currentStep, mailboxType, accessMode, mailboxId) {
    switch (currentStep) {
      case 0:
        return (
          <WizardPersonalise
            className={classes.detail}
            onRequestCancel={this.handleClose}
            MailboxClass={MailboxFactory.getClass(mailboxType)}
            accessMode={accessMode} />
        )
      case 1:
        return (
          <WizardAuth className={classes.detail} />
        )
      case 2:
        return (
          <WizardConfigure
            onRequestCancel={this.handleClose}
            className={classes.detail}
            mailboxId={mailboxId} />
        )
    }
  }

  render () {
    const { open } = this.state
    const { match, classes } = this.props
    const currentStep = parseInt(match.params.step)

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          <MailboxWizardStepper currentStep={currentStep} className={classes.master} />
          {this.renderStep(
            classes,
            currentStep,
            match.params.mailboxType,
            match.params.accessMode,
            match.params.mailboxId
          )}
        </DialogContent>
      </Dialog>
    )
  }
}

export default MailboxWizardScene
