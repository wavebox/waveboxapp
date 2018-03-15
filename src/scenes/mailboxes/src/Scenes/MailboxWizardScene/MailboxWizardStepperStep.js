import PropTypes from 'prop-types'
import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import shallowCompare from 'react-addons-shallow-compare'
import { FontIcon } from 'material-ui'

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
    borderWidth: 2
  },
  stepCheckRaw: {
    fontSize: '35px',
    lineHeight: '60px',
    verticalAlign: 'middle',
    marginTop: -10
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
  backgroundColor: Colors.lightBlue700,
  color: 'rgba(255, 255, 255, 0.3)'
}
styles.stepIconActive = {
  ...styles.stepIconRaw,
  borderColor: 'rgb(255, 255, 255)',
  backgroundColor: Colors.redA200,
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

export default class MailboxWizardStepperStep extends React.Component {
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
  * @param step: the step to get the text for
  * @param active: true if this step is active
  * @return jsx
  */
  renderStepText (step, active) {
    switch (step) {
      case 0:
        return (
          <div style={active ? styles.stepTextActive : styles.stepTextInactive}>
            Personalise
          </div>
        )
      case 1:
        return (
          <div style={active ? styles.stepTextActive : styles.stepTextInactive}>
            Sign in
          </div>
        )
      case 2:
        return (
          <div style={active ? styles.stepTextActive : styles.stepTextInactive}>
            Configure
          </div>
        )
    }
  }

  /**
  * Renders the step icon
  * @param step: the step to render for
  * @param active: true if this step is active
  * @param complete: true if this step is complete
  * @return jsx
  */
  renderStepIcon (step, active, complete) {
    return (
      <div style={active ? styles.stepIconActive : styles.stepIconInactive}>
        {complete ? (
          <FontIcon
            style={active ? styles.stepCheckActive : styles.stepCheckInactive}
            className='fas fa-check' />
        ) : (
          <span style={styles.stepNumber}>{step + 1}</span>
        )}
      </div>
    )
  }

  render () {
    const { renderStep, currentStep, style, ...passProps } = this.props

    return (
      <div {...passProps} style={{...styles.container, ...style}}>
        {this.renderStepIcon(renderStep, currentStep === renderStep, currentStep > renderStep)}
        {this.renderStepText(renderStep, currentStep === renderStep)}
      </div>
    )
  }
}
