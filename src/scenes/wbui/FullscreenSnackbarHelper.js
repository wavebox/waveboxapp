import React from 'react'
import PropTypes from 'prop-types'
import { Snackbar, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import ElectronAccelerator from './ElectronAccelerator'
import { withStyles } from '@material-ui/core/styles'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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
    WBRPCRenderer.browserWindow.on('enter-full-screen', this.handleEnterFullScreen)
    WBRPCRenderer.browserWindow.on('leave-full-screen', this.handleLeaveFullScreen)
  }

  componentWillUnmount () {
    WBRPCRenderer.browserWindow.removeListener('enter-full-screen', this.handleEnterFullScreen)
    WBRPCRenderer.browserWindow.removeListener('leave-full-screen', this.handleLeaveFullScreen)
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
