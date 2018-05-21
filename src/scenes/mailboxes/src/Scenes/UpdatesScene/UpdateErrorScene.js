import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core'
import { updaterActions, updaterStore } from 'stores/updater'
import UpdateModalTitle from './UpdateModalTitle'
import electron from 'electron'
import pkg from 'package.json'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import ErrorIcon from '@material-ui/icons/Error'

const styles = {
  dialogContent: {
    width: 600
  },
  title: {
    color: red[900]
  },
  icon: {
    color: red[900]
  },
  button: {
    marginLeft: 8,
    marginRight: 8
  }
}

@withStyles(styles)
class UpdateErrorScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes: {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual'])
      })
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    updaterStore.listen(this.updaterStoreChanged)
  }

  componentWillUnmount () {
    updaterStore.unlisten(this.updaterStoreChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const updaterState = updaterStore.getState()
    return {
      open: true,
      updateFailedCount: updaterState.updateFailedCount
    }
  })()

  updaterStoreChanged = (updaterState) => {
    this.setState({
      updateFailedCount: updaterState.updateFailedCount
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  }

  /**
  * Checks for updates again later
  */
  handleCheckLater = () => {
    this.handleClose()
    updaterActions.scheduleNextUpdateCheck()
  }

  /**
  * Takes the user to the web to download manually
  */
  handleDownloadManually = () => {
    this.handleClose()
    electron.remote.shell.openExternal(updaterStore.getState().getManualUpdateDownloadUrl())
  }

  /**
  * Trys to check for updates again
  */
  handleCheckAgain = () => {
    this.handleClose()
    updaterActions.userCheckForUpdates()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the message for the user
  * @param classes:
  * @param provider: the provider user to action the update
  * @param tries: the download tries
  * @return jsx
  */
  renderMessage (classes, provider, tries) {
    if (provider === 'squirrel') {
      if (tries > 1) {
        return (
          <p>
            Wavebox has been trying to check &amp; download updates but has failed a number of
            times. Would you like to check again or download them manually?
          </p>
        )
      } else {
        return (
          <p>
            Wavebox has been trying to check &amp; download updates but has failed. Would you
            like to check again or download them manually?
          </p>
        )
      }
    } else if (provider === 'manual') {
      if (tries > 1) {
        return (
          <p>
            Wavebox has been trying to check for updates updates but has failed a number
            of times. Would you like to check again or download them manually?
          </p>
        )
      } else {
        return (
          <p>
            Wavebox has been trying to check for updates updates but has failed. Would
            you like to check again or download them manually?
          </p>
        )
      }
    }
  }

  render () {
    const { open, updateFailedCount } = this.state
    const {
      match: { params: { provider } },
      classes
    } = this.props

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleCheckLater}>
        <UpdateModalTitle
          text='Update Error'
          IconClass={ErrorIcon}
          iconClassName={classes.icon}
          titleClassName={classes.title} />
        <DialogContent className={classes.dialogContent}>
          {this.renderMessage(classes, provider, updateFailedCount)}
          <p style={{ fontSize: '85%' }}>
            You're currently using Wavebox version <strong>{pkg.version}</strong>
          </p>
        </DialogContent>
        <DialogActions>
          <Button className={classes.button} onClick={this.handleCheckLater}>
            Retry later
          </Button>
          <Button className={classes.button} onClick={this.handleDownloadManually}>
            Download manually
          </Button>
          <Button variant='raised' color='primary' className={classes.button} onClick={this.handleCheckAgain}>
            Try again
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default UpdateErrorScene
