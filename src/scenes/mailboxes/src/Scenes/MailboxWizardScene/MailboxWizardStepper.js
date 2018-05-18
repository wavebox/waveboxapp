import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxWizardStepperStep from './MailboxWizardStepperStep'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'
import lightBlue from 'material-ui/colors/lightBlue'

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
    currentStep: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { currentStep, classes, className, ...passProps } = this.props

    return (
      <div className={classNames(classes.container, className)} {...passProps}>
        <MailboxWizardStepperStep renderStep={0} currentStep={currentStep} />
        <MailboxWizardStepperStep renderStep={1} currentStep={currentStep} />
        <MailboxWizardStepperStep renderStep={2} currentStep={currentStep} />
      </div>
    )
  }
}

export default MailboxWizardStepper
