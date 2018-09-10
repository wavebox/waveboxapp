import React from 'react'
import PropTypes from 'prop-types'
import { Snackbar, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import ElectronAccelerator from './ElectronAccelerator'
import { withStyles } from '@material-ui/core/styles'

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

@withStyles(styles)
class FullscreenSnackbarHelper extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    accelerator: PropTypes.string
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const browserWindow = remote.getCurrentWindow()
    browserWindow.on('enter-full-screen', this.handleEnterFullScreen)
    browserWindow.on('leave-full-screen', this.handleLeaveFullScreen)
  }

  componentWillUnmount () {
    const browserWindow = remote.getCurrentWindow()
    browserWindow.removeListener('enter-full-screen', this.handleEnterFullScreen)
    browserWindow.removeListener('leave-full-screen', this.handleLeaveFullScreen)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleEnterFullScreen = (evt) => {
    this.setState({ open: true })
  }

  handleLeaveFullScreen = (evt) => {
    this.setState({ open: false })
  }

  handleDismiss = (evt) => {
    this.setState({ open: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { accelerator, classes } = this.props
    const { open } = this.state
    const isValid = ElectronAccelerator.isValid(accelerator)

    return (
      <Snackbar
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open && isValid}
        onClose={this.handleDismiss}
        action={(
          <Button color='secondary' size='small' onClick={this.handleDismiss}>
            Okay
          </Button>
        )}
        message={(
          <span>
            Press
            <ElectronAccelerator
              className={classes.accelerator}
              keyClassName={classes.kbd}
              accelerator={accelerator} />
            to exit fullscreen
          </span>
        )}
      />
    )
  }
}

export default FullscreenSnackbarHelper
