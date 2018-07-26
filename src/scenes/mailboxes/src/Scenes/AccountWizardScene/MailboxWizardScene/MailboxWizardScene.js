import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WizardPersonalise from './WizardPersonalise'
import WizardAuth from './WizardAuth'
import WizardConfigure from './WizardConfigure'
import WizardStepperDialog from '../Common/WizardStepperDialog'
import {
  ACCOUNT_TEMPLATE_TYPE_LIST,
  ACCOUNT_TEMPLATES
} from 'shared/Models/ACAccounts/AccountTemplates'

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
        templateType: PropTypes.oneOf(ACCOUNT_TEMPLATE_TYPE_LIST).isRequired,
        accessMode: PropTypes.string.isRequired,
        step: PropTypes.string.isRequired,
        mailboxId: PropTypes.string
      })
    })
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.templateType !== nextProps.match.params.templateType) {
      this.setState({
        steps: this.generateStepsArray(nextProps.match.params.templateType)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      steps: this.generateStepsArray(this.props.match.params.templateType)
    }
  })()

  /**
  * Generates the steps array
  * @param templateType: the type of template
  * @return an array of step configs for the state
  */
  generateStepsArray (templateType) {
    const template = ACCOUNT_TEMPLATES[templateType]
    if (template && template.hasAuthStep) {
      return [
        { step: 0, text: 'Personalise', stepNumberText: '1' },
        { step: 1, text: 'Sign in', stepNumberText: '2' },
        { step: 2, text: 'Configure', stepNumberText: '3' }
      ]
    } else {
      return [
        { step: 0, text: 'Personalise', stepNumberText: '1' },
        { step: 2, text: 'Configure', stepNumberText: '2' }
      ]
    }
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  * @param destination='/' an optional destination when dismissin
  */
  handleClose = (destination = '/') => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = destination
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
  * @param template: the template type
  * @param accessMode: the access mode to use when creating the mailbox
  * @param mailboxId: the id of the mailbox
  * @return jsx
  */
  renderStep (currentStep, template, accessMode, mailboxId) {
    switch (currentStep) {
      case 0:
        return (
          <WizardPersonalise
            onRequestCancel={this.handleClose}
            template={ACCOUNT_TEMPLATES[template]}
            accessMode={accessMode} />
        )
      case 1:
        return (
          <WizardAuth />
        )
      case 2:
        return (
          <WizardConfigure
            onRequestCancel={this.handleClose}
            mailboxId={mailboxId} />
        )
    }
  }

  render () {
    const { open, steps } = this.state
    const { match } = this.props
    const currentStep = parseInt(match.params.step)

    return (
      <WizardStepperDialog open={open} steps={steps} currentStep={currentStep}>
        {this.renderStep(
          currentStep,
          match.params.templateType,
          match.params.accessMode,
          match.params.mailboxId
        )}
      </WizardStepperDialog>
    )
  }
}

export default MailboxWizardScene
