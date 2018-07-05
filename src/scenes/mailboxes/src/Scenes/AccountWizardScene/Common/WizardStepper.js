import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WizardStepperStep from './WizardStepperStep'
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
    steps: PropTypes.arrayOf(PropTypes.shape({
      step: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      stepNumberText: PropTypes.string.isRequired
    })).isRequired,
    currentStep: PropTypes.number.isRequired
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
      steps,
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <div className={classNames(classes.container, className)} {...passProps}>
        {steps.map(({step, text, stepNumberText}) => {
          return (
            <WizardStepperStep
              key={step}
              step={step}
              text={text}
              stepNumberText={stepNumberText}
              currentStep={currentStep} />
          )
        })}
      </div>
    )
  }
}

export default MailboxWizardStepper
