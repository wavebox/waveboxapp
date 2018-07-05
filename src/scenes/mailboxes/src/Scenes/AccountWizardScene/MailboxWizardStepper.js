import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxWizardStepperStep from './MailboxWizardStepperStep'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  container: {
    width: 150,
    height: '100%',
    backgroundColor: lightBlue[600],
    paddingTop: 40,
    overflowY: 'auto'
  }
}

@withStyles(styles)
class MailboxWizardStepper extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    currentStep: PropTypes.number.isRequired,
    hasAuthStep: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      currentStep,
      classes,
      hasAuthStep,
      className,
      ...passProps
    } = this.props

    return hasAuthStep ? (
      <div className={classNames(classes.container, className)} {...passProps}>
        <MailboxWizardStepperStep
          step={0}
          text='Personalise'
          stepNumberText={1}
          currentStep={currentStep} />
        <MailboxWizardStepperStep
          step={1}
          text='Sign in'
          stepNumberText={2}
          currentStep={currentStep} />
        <MailboxWizardStepperStep
          step={2}
          text='Configure'
          stepNumberText={3}
          currentStep={currentStep} />
      </div>
    ) : (
      <div className={classNames(classes.container, className)} {...passProps}>
        <MailboxWizardStepperStep
          step={0}
          text='Personalise'
          stepNumberText={1}
          currentStep={currentStep} />
        <MailboxWizardStepperStep
          step={2}
          text='Configure'
          stepNumberText={2}
          currentStep={currentStep} />
      </div>
    )
  }
}

export default MailboxWizardStepper
