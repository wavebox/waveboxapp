import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogContent } from '@material-ui/core'
import WizardStepper from './WizardStepper'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  dialogContent: {
    position: 'relative',
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

@withStyles(styles)
class WizardStepperDialogContent extends React.Component {
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
      classes,
      steps,
      currentStep,
      children,
      className,
      ...passProps
    } = this.props

    return (
      <DialogContent className={classNames(className, classes.dialogContent)} {...passProps}>
        <WizardStepper
          className={classes.master}
          currentStep={currentStep}
          steps={steps} />
        <div className={classes.detail}>
          {children}
        </div>
      </DialogContent>
    )
  }
}

export default WizardStepperDialogContent
