import React from 'react'
import { Snackbar, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { ipcRenderer } from 'electron'
import ElectronAccelerator from './ElectronAccelerator'
import { withStyles } from '@material-ui/core/styles'
import {
  WB_ATTEMPT_FULL_QUIT_KEYBOARD_ACCEL,
  WB_QUIT_APP
} from 'shared/ipcEvents'

const styles = {
  accelerator: {
    display: 'inline-block',
    margin: '0px 0.5ch'
  },
  kbd: {
    display: 'inline-block',
    border: '2px solid #FFF',
    padding: 4,
    borderRadius: 4,
    margin: '0px 1ch',
    minWidth: 30,
    textAlign: 'center',
    fontFamily: 'inherit'
  }
}

const QUIT_CYCLE_LENGTH = 3000

@withStyles(styles)
class KeyboardQuitSnackbarHelper extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.quitCycleCancel = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_ATTEMPT_FULL_QUIT_KEYBOARD_ACCEL, this._handleAttemptQuit)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_ATTEMPT_FULL_QUIT_KEYBOARD_ACCEL, this._handleAttemptQuit)
    clearTimeout(this.quitCycleCancel)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    accelerator: null,
    isInQuitCycle: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the attempted full quit
  * @param evt: the event that fired
  * @param accelerator: the keyboard accelerator
  */
  _handleAttemptQuit = (evt, accelerator) => {
    if (ElectronAccelerator.isValid(accelerator)) {
      this.setState((prevState) => {
        clearTimeout(this.quitCycleCancel)
        if (prevState.isInQuitCycle) {
          ipcRenderer.send(WB_QUIT_APP)
          return { isInQuitCycle: false }
        } else {
          this.quitCycleCancel = setTimeout(() => {
            this.setState({ isInQuitCycle: false })
          }, QUIT_CYCLE_LENGTH)
          return {
            accelerator: accelerator,
            isInQuitCycle: true
          }
        }
      })
    } else {
      ipcRenderer.send(WB_QUIT_APP)
    }
  }

  handleDismiss = () => {
    clearTimeout(this.quitCycleCancel)
    this.setState({ isInQuitCycle: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { accelerator, isInQuitCycle } = this.state
    const isValid = ElectronAccelerator.isValid(accelerator)

    return (
      <Snackbar
        autoHideDuration={QUIT_CYCLE_LENGTH}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={isInQuitCycle && isValid}
        onClose={this.handleDismiss}
        action={(
          <Button color='secondary' size='small' onClick={this.handleDismiss}>
            Cancel
          </Button>
        )}
        message={(
          <span>
            Press
            <ElectronAccelerator
              className={classes.accelerator}
              keyClassName={classes.kbd}
              accelerator={accelerator} />
            again to quit
          </span>
        )}
      />
    )
  }
}

export default KeyboardQuitSnackbarHelper
