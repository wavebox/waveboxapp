import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'
import red from '@material-ui/core/colors/red'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasCheck from '@fortawesome/fontawesome-pro-solid/faCheck'

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
    // Fixes a rendering glitch in electron-2
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden'
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
class MailboxWizardStepperStep extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    renderStep: PropTypes.number.isRequired,
    currentStep: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param classes:
  * @param step: the step to get the text for
  * @param active: true if this step is active
  * @return jsx
  */
  renderStepText (classes, step, active) {
    switch (step) {
      case 0:
        return (
          <div className={active ? classes.stepTextActive : classes.stepTextInactive}>
            Personalise
          </div>
        )
      case 1:
        return (
          <div className={active ? classes.stepTextActive : classes.stepTextInactive}>
            Sign in
          </div>
        )
      case 2:
        return (
          <div className={active ? classes.stepTextActive : classes.stepTextInactive}>
            Configure
          </div>
        )
    }
  }

  /**
  * Renders the step icon
  * @param classes:
  * @param step: the step to render for
  * @param active: true if this step is active
  * @param complete: true if this step is complete
  * @return jsx
  */
  renderStepIcon (classes, step, active, complete) {
    return (
      <div className={active ? classes.stepIconActive : classes.stepIconInactive}>
        {complete ? (
          <FontAwesomeIcon
            icon={fasCheck}
            className={classNames(active ? classes.stepCheckActive : classes.stepCheckInactive)} />
        ) : (
          <span className={classes.stepNumber}>{step + 1}</span>
        )}
      </div>
    )
  }

  render () {
    const { renderStep, currentStep, className, classes, ...passProps } = this.props

    return (
      <div {...passProps} className={classNames(classes.container, className)}>
        {this.renderStepIcon(classes, renderStep, currentStep === renderStep, currentStep > renderStep)}
        {this.renderStepText(classes, renderStep, currentStep === renderStep)}
      </div>
    )
  }
}

export default MailboxWizardStepperStep
