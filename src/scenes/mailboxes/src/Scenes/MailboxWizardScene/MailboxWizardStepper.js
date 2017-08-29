import PropTypes from 'prop-types'
import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxWizardStepperStep from './MailboxWizardStepperStep'

const styles = {
  container: {
    width: 150,
    height: '100%',
    backgroundColor: Colors.lightBlue600,
    paddingTop: 40,
    overflowY: 'auto'
  }
}

export default class MailboxWizardStepper extends React.Component {
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
    const { currentStep, style, ...passProps } = this.props

    return (
      <div style={{...styles.container, ...style}} {...passProps}>
        <MailboxWizardStepperStep renderStep={0} currentStep={currentStep} />
        <MailboxWizardStepperStep renderStep={1} currentStep={currentStep} />
        <MailboxWizardStepperStep renderStep={2} currentStep={currentStep} />
      </div>
    )
  }
}
