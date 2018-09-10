import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WizardPersonalise from './WizardPersonalise'
import { userStore } from 'stores/user'
import { accountActions } from 'stores/account'
import WizardConfigure from './WizardConfigure'
import WizardStepperDialog from '../Common/WizardStepperDialog'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import ACProvisoService from 'shared/Models/ACAccounts/ACProvisoService'
import WizardAuth from './WizardAuth'

class ServiceWizardScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        accessMode: PropTypes.string.isRequired,
        step: PropTypes.string.isRequired,
        serviceId: PropTypes.string,
        serviceType: PropTypes.oneOf(Object.keys(SERVICE_TYPES)).isRequired,
        attachTarget: PropTypes.string.isRequired
      })
    })
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.serviceType !== nextProps.match.params.serviceType || this.props.match.params.accessMode !== nextProps.match.params.accessMode) {
      this.setState({
        steps: this.generateStepsArray(
          nextProps.match.params.serviceType,
          nextProps.match.params.accessMode,
          userStore.getState()
        )
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      steps: this.generateStepsArray(
        this.props.match.params.serviceType,
        this.props.match.params.accessMode,
        userStore.getState()
      )
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      steps: this.generateStepsArray(
        this.props.match.params.serviceType,
        this.props.match.params.accessMode,
        userState
      )
    })
  }

  /**
  * Generates the steps array
  * @param serviceType: the type of service
  * @param accessMode: the access mode of the service
  * @param userState: the current user state
  * @return an array of step configs for the state
  */
  generateStepsArray (serviceType, accessMode, userState) {
    let hasPersonalise = false
    let hasAuth = true
    let hasConfigure = true

    if (serviceType === SERVICE_TYPES.GENERIC) {
      hasPersonalise = true
    } else if (serviceType === SERVICE_TYPES.CONTAINER) {
      const container = userState.getContainer(accessMode)
      if (container && container.installHasPersonaliseStep) {
        hasPersonalise = true
      }
    }

    if (serviceType === SERVICE_TYPES.GENERIC) {
      hasAuth = false
    } else if (serviceType === SERVICE_TYPES.CONTAINER) {
      hasAuth = false
    }

    if (serviceType === SERVICE_TYPES.TRELLO) {
      hasConfigure = false
    } else if (serviceType === SERVICE_TYPES.SLACK) {
      hasConfigure = false
    }

    const steps = []
    if (hasPersonalise) {
      steps.push({ step: 0, text: 'Personalise', stepNumberText: `${steps.length + 1}` })
    }
    if (hasAuth) {
      steps.push({ step: 1, text: 'Sign in', stepNumberText: `${steps.length + 1}` })
    }
    if (hasConfigure) {
      steps.push({ step: 2, text: 'Configure', stepNumberText: `${steps.length + 1}` })
    }

    return steps
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

  /**
  * Handles the personalise step pressing next
  */
  handleNextFromPersonalise = (serviceJS) => {
    accountActions.authNewServiceFromProviso(
      new ACProvisoService({
        serviceId: this.props.match.params.serviceId,
        accessMode: this.props.match.params.accessMode,
        serviceType: this.props.match.params.serviceType,
        parentId: this.props.match.params.attachTarget,
        expando: serviceJS
      })
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, steps } = this.state
    const { match } = this.props
    const currentStep = parseInt(match.params.step)

    return (
      <WizardStepperDialog open={open} steps={steps} currentStep={currentStep}>
        {currentStep === 0 ? (
          <WizardPersonalise
            serviceType={match.params.serviceType}
            accessMode={match.params.accessMode}
            onRequestCancel={this.handleClose}
            onRequestNext={this.handleNextFromPersonalise} />
        ) : undefined}
        {currentStep === 1 ? (
          <WizardAuth />
        ) : undefined}
        {currentStep === 2 ? (
          <WizardConfigure
            serviceId={match.params.serviceId}
            onRequestCancel={this.handleClose} />
        ) : undefined}
      </WizardStepperDialog>
    )
  }
}

export default ServiceWizardScene
