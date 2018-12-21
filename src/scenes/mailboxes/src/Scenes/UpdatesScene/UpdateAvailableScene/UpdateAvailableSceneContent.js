import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogActions, DialogContent, Button } from '@material-ui/core'
import { updaterActions, updaterStore } from 'stores/updater'
import UpdateModalTitle from '../Common/UpdateModalTitle'
import electron from 'electron'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialogContent: {
    width: 600
  },
  method: {
    display: 'inline-block',
    width: 100
  },
  managerCode: {
    padding: 8,
    fontSize: 14,
    lineHeight: 1.4,
    color: '#333333',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    backgroundColor: '#F5F5F5',
    border: '1px solid #CCCCCC',
    borderRadius: 4
  },
  button: {
    marginLeft: 8,
    marginRight: 8
  }
}

@withStyles(styles)
class UpdateAvailableSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual']).isRequired
      }).isRequired
    }).isRequired
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

  /* **************************************************************************/
  // UI Events: Squirrel
  /* **************************************************************************/

  /**
  * Installs the new update
  */
  handleSquirrelInstall = () => {
    window.location.hash = '/'
    updaterActions.squirrelInstallUpdate()
  }

  /* **************************************************************************/
  // UI Events: Manual
  /* **************************************************************************/

  /**
  * Reprompts the user later on
  */
  handleCheckLater = () => {
    window.location.hash = '/'
    updaterActions.scheduleNextUpdateCheck()
  }

  /**
  * Takes the user to the download page
  */
  handleDownloadManual = () => {
    window.location.hash = '/'
    const updaterState = updaterStore.getState()
    electron.remote.shell.openExternal(updaterState.lastManualDownloadUrl || updaterState.getManualUpdateDownloadUrl())
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the actions for the given provider
  * @param classes:
  * @param provider: the provider giving the updates
  * @return jsx
  */
  renderActions (classes, provider) {
    if (provider === 'squirrel') {
      return (
        <DialogActions>
          <Button className={classes.button} onClick={this.handleClose}>
            After Restart
          </Button>
          <Button className={classes.button} onClick={this.handleCheckLater}>
            Later
          </Button>
          <Button variant='contained' color='primary' className={classes.button} onClick={this.handleSquirrelInstall}>
            Install Now
          </Button>
        </DialogActions>
      )
    } else if (provider === 'manual') {
      return (
        <DialogActions>
          <Button className={classes.button} onClick={this.handleClose}>
            After Restart
          </Button>
          <Button className={classes.button} onClick={this.handleCheckLater}>
            Later
          </Button>
          <Button variant='contained' color='primary' className={classes.button} onClick={this.handleDownloadManual}>
            Download Now
          </Button>
        </DialogActions>
      )
    }
  }

  /**
  * Renders the message for the given provider
  * @param classes:
  * @param provider: the provider giving the updates
  * @return jsx
  */
  renderMessage (classes, provider) {
    if (provider === 'squirrel') {
      return (
        <p>A new version of Wavebox has been downloaded and is ready to install. Do you want to install it now?</p>
      )
    } else if (provider === 'manual') {
      if (process.platform === 'linux') {
        return (
          <div>
            <p>A newer version of Wavebox is now available.</p>
            <p>
              Depending on how you installed Wavebox you may be able to update using your package
              manager, otherwise you can download the update using your web browser
            </p>
            <p>
              <strong className={classes.method}>Snap:</strong>
              <code className={classes.managerCode}>
                {`sudo snap refresh wavebox`}
              </code>
            </p>
            <p>
              <strong className={classes.method}>Apt:</strong>
              <code className={classes.managerCode}>
                {`sudo apt update; sudo apt install wavebox`}
              </code>
            </p>
            <p>
              <strong className={classes.method}>Yum:</strong>
              <code className={classes.managerCode}>
                {`sudo yum update Wavebox`}
              </code>
            </p>
            <p>
              <strong className={classes.method}>Zypper:</strong>
              <code className={classes.managerCode}>
                {`sudo zypper refresh; sudo zypper up Wavebox`}
              </code>
            </p>
          </div>
        )
      } else {
        return (
          <p>A newer version of Wavebox is now available. Do you want to download it now?</p>
        )
      }
    }
  }

  render () {
    const {
      match: { params: { provider } },
      classes
    } = this.props

    return (
      <React.Fragment>
        <UpdateModalTitle />
        <DialogContent className={classes.dialogContent}>
          {this.renderMessage(classes, provider)}
        </DialogContent>
        {this.renderActions(classes, provider)}
      </React.Fragment>
    )
  }
}

export default UpdateAvailableSceneContent
