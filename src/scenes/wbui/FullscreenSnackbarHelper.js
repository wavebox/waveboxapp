import React from 'react'
import PropTypes from 'prop-types'
import { Snackbar, SnackbarContent, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import ElectronAccelerator from './ElectronAccelerator'
import { withStyles } from '@material-ui/core/styles'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  snackbarContentRoot: {
    flexDirection: 'column'
  },
  snackbarContentAction: {
    width: '100%',
    justifyContent: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10
  },
  snackbarContentMessage: {
    width: '100%',
    textAlign: 'center'
  },
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
    accelerator: PropTypes.string,
    onRequestStopShowing: PropTypes.func
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

  handleStopShowing = (evt) => {
    this.setState({ open: false })
    const onRequestStopShowing = this.props.onRequestStopShowing()
    setTimeout(() => {
      onRequestStopShowing()
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { accelerator, classes, onRequestStopShowing } = this.props
    const { open } = this.state
    const isValid = ElectronAccelerator.isValid(accelerator)

    return (
      <Snackbar
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open && isValid}
        onClose={this.handleDismiss}>
        <SnackbarContent
          classes={onRequestStopShowing ? {
            root: classes.snackbarContentRoot,
            action: classes.snackbarContentAction,
            message: classes.snackbarContentMessage
          } : undefined}
          action={(
            <React.Fragment>
              {onRequestStopShowing ? (
                <Button color='secondary' size='small' onClick={this.handleStopShowing}>
                  Stop showing
                </Button>
              ) : undefined}
              <Button color='secondary' size='small' onClick={this.handleDismiss}>
                Dismiss
              </Button>
            </React.Fragment>
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
          )} />
      </Snackbar>
    )
  }
}

export default FullscreenSnackbarHelper
