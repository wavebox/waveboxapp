import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxWizardStepper from './MailboxWizardStepper'
import { FullscreenModal } from 'Components'
import MailboxTypes from 'shared/Models/Accounts/MailboxTypes'
import MailboxFactory from 'shared/Models/Accounts/MailboxFactory'
import WizardPersonalise from './WizardPersonalise'
import WizardAuth from './WizardAuth'
import WizardConfigure from './WizardConfigure'

const styles = {
  modalBody: {
    borderRadius: 2,
    padding: 0,
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

export default class MailboxWizardScene extends React.Component {
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
  * @param currentStep: the step to render
  * @param mailboxType: the mailbox type
  * @param accessMode: the access mode to use when creating the mailbox
  * @param mailboxId: the id of the mailbox
  * @return jsx
  */
  renderStep (currentStep, mailboxType, accessMode, mailboxId) {
    switch (currentStep) {
      case 0:
        return (
          <WizardPersonalise
            style={styles.detail}
            onRequestCancel={this.handleClose}
            MailboxClass={MailboxFactory.getClass(mailboxType)}
            accessMode={accessMode} />
        )
      case 1:
        return (
          <WizardAuth style={styles.detail} />
        )
      case 2:
        return (
          <WizardConfigure
            onRequestCancel={this.handleClose}
            style={styles.detail}
            mailboxId={mailboxId} />
        )
    }
  }

  render () {
    const { open } = this.state
    const { match } = this.props
    const currentStep = parseInt(match.params.step)

    return (
      <FullscreenModal
        modal
        open={open}
        bodyStyle={styles.modalBody}>
        <MailboxWizardStepper
          currentStep={currentStep}
          style={styles.master} />
        {this.renderStep(currentStep, match.params.mailboxType, match.params.accessMode, match.params.mailboxId)}
      </FullscreenModal>
    )
  }
}
