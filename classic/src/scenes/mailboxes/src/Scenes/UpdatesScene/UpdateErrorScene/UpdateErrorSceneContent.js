import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogContent, DialogActions, Button } from '@material-ui/core'
import { updaterActions, updaterStore } from 'stores/updater'
import UpdateModalTitle from '../Common/UpdateModalTitle'
import pkg from 'package.json'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import ErrorIcon from '@material-ui/icons/Error'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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
class UpdateErrorSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual'])
      }).isRequired
    }).isRequired
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
    window.location.hash = '/'
  }

  /**
  * Checks for updates again later
  */
  handleCheckLater = () => {
    window.location.hash = '/'
    updaterActions.scheduleNextUpdateCheck()
  }

  /**
  * Takes the user to the web to download manually
  */
  handleDownloadManually = () => {
    window.location.hash = '/'
    WBRPCRenderer.wavebox.openExternal(updaterStore.getState().getManualUpdateDownloadUrl())
  }

  /**
  * Trys to check for updates again
  */
  handleCheckAgain = () => {
    window.location.hash = '/'
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
    const { updateFailedCount } = this.state
    const {
      match: { params: { provider } },
      classes
    } = this.props

    return (
      <React.Fragment>
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
          <Button variant='contained' color='primary' className={classes.button} onClick={this.handleCheckAgain}>
            Try again
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default UpdateErrorSceneContent
