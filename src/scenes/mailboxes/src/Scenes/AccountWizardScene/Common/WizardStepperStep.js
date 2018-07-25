import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'
import red from '@material-ui/core/colors/red'
import FASCheckIcon from 'wbfa/FASCheck'

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20
  },
  stepIconRaw: {
    display: 'inline-block',
    width: 60,
    height: 60,
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '60px',
    fontSize: '35px',
    borderStyle: 'solid',
    borderWidth: 2,
    position: 'relative'
  },
  stepCheckRaw: {
    fontSize: '35px',
    lineHeight: '60px',
    verticalAlign: 'middle',
    marginTop: -10,
    height: 60,
    width: 60
  },
  stepNumber: {
    display: 'inline-block',
    marginTop: -10,
    verticalAlign: 'middle'
  },
  stepTextRaw: {
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: 10,
    fontSize: '14px'
  }
}
styles.stepIconInactive = {
  ...styles.stepIconRaw,
  borderColor: 'rgba(255, 255, 255, 0.3)',
  backgroundColor: lightBlue[700],
  color: 'rgba(255, 255, 255, 0.3)'
}
styles.stepIconActive = {
  ...styles.stepIconRaw,
  borderColor: 'rgb(255, 255, 255)',
  backgroundColor: red['A200'],
  color: 'rgb(255, 255, 255)'
}
styles.stepCheckInactive = {
  ...styles.stepCheckRaw,
  color: 'rgba(255, 255, 255, 0.3)'
}
styles.stepCheckActive = {
  ...styles.stepCheckRaw,
  color: 'rgb(255, 255, 255)'
}
styles.stepTextInactive = {
  ...styles.stepTextRaw,
  color: 'rgb(82, 88, 87)'
}
styles.stepTextActive = {
  ...styles.stepTextRaw,
  color: 'white'
}

@withStyles(styles)
class WizardStepperStep extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    step: PropTypes.number.isRequired,
    currentStep: PropTypes.number.isRequired,
    stepNumberText: PropTypes.node.isRequired,
    text: PropTypes.node.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      step,
      currentStep,
      stepNumberText,
      className,
      classes,
      text,
      ...passProps
    } = this.props

    const active = currentStep === step
    return (
      <div {...passProps} className={classNames(classes.container, className)}>
        <div className={active ? classes.stepIconActive : classes.stepIconInactive}>
          {currentStep > step ? (
            <FASCheckIcon className={classNames(active ? classes.stepCheckActive : classes.stepCheckInactive)} />
          ) : (
            <span className={classes.stepNumber}>{stepNumberText}</span>
          )}
        </div>
        <div className={active ? classes.stepTextActive : classes.stepTextInactive}>
          {text}
        </div>
      </div>
    )
  }
}

export default WizardStepperStep
