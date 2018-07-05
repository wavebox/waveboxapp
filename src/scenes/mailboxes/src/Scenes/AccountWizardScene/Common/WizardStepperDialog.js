import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, DialogContent } from '@material-ui/core'
import WizardStepper from './WizardStepper'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%',
    minWidth: 580
  },
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
class WizardStepperDialog extends React.Component {
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
      ...passProps
    } = this.props

    return (
      <Dialog
        disableEnforceFocus
        classes={{ paper: classes.dialog }}
        {...passProps}>
        <DialogContent className={classes.dialogContent}>
          <WizardStepper
            className={classes.master}
            currentStep={currentStep}
            steps={steps} />
          <div className={classes.detail}>
            {children}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default WizardStepperDialog
