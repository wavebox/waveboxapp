import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogActions, DialogContent, Button } from '@material-ui/core'
import { updaterActions, updaterStore } from 'stores/updater'
import UpdateModalTitle from '../Common/UpdateModalTitle'
import { withStyles } from '@material-ui/core/styles'
import querystring from 'querystring'
import Platform from 'shared/Platform'
import DistributionConfig from 'Runtime/DistributionConfig'
import classNames from 'classnames'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import blue from '@material-ui/core/colors/blue'

const styles = {
  dialogContent: {
    width: 600
  },
  method: {
    display: 'inline-block',
    width: 100
  },
  managerCode: {
    display: 'inline-block',
    padding: 8,
    fontSize: 14,
    lineHeight: 1.4,
    color: '#333333',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    backgroundColor: '#F5F5F5',
    border: '1px solid #CCCCCC',
    borderRadius: 4,
    userSelect: 'all'
  },
  managerCodeFullWidth: {
    width: '100%'
  },
  button: {
    marginLeft: 8,
    marginRight: 8
  },
  showAllPackageManagersButton: {
    marginTop: 16
  },
  changelogLink: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[600],
    fontSize: '85%'
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
    }).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string
    }).isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    showAllPackageManagerCommands: false
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
  * Shows all the package manager commands
  */
  handleShowAllPackageManagerCommands = () => {
    this.setState({ showAllPackageManagerCommands: true })
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
    WBRPCRenderer.wavebox.openExternal(updaterState.lastManualDownloadUrl || updaterState.getManualUpdateDownloadUrl())
  }

  /**
  * Opens a changelog
  */
  handleOpenChangelog = () => {
    WBRPCRenderer.wavebox.openExternal(updaterStore.getState().getChangelogUrl())
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
            Download
          </Button>
        </DialogActions>
      )
    }
  }

  /**
  * Renders the install instruction for a linux package manager
  * @param manager: the package manager
  * @return the instruction
  */
  renderLinuxPackageManagerCommand (manager) {
    switch (manager) {
      case Platform.PACKAGE_MANAGERS.SNAP: return `sudo snap refresh wavebox`
      case Platform.PACKAGE_MANAGERS.APT: return `sudo apt update; sudo apt install wavebox`
      case Platform.PACKAGE_MANAGERS.YUM: return `sudo yum update Wavebox`
      case Platform.PACKAGE_MANAGERS.ZYPPER: return `sudo zypper refresh; sudo zypper up Wavebox`
      default: return undefined
    }
  }

  /**
  * Renders all the linux package manager commands
  * @param classes: the classes to use
  * @param exclude=undefined: any manager to exclude
  * @return jsx
  */
  renderAllLinuxPackageManagerCommands (classes, exclude = undefined) {
    return (
      <React.Fragment>
        {exclude !== Platform.PACKAGE_MANAGERS.APT ? (
          <p>
            <strong className={classes.method}>Apt:</strong>
            <code className={classes.managerCode}>
              {this.renderLinuxPackageManagerCommand(Platform.PACKAGE_MANAGERS.APT)}
            </code>
          </p>
        ) : undefined}
        {exclude !== Platform.PACKAGE_MANAGERS.SNAP ? (
          <p>
            <strong className={classes.method}>Snap:</strong>
            <code className={classes.managerCode}>
              {this.renderLinuxPackageManagerCommand(Platform.PACKAGE_MANAGERS.SNAP)}
            </code>
          </p>
        ) : undefined}
        {exclude !== Platform.PACKAGE_MANAGERS.YUM ? (
          <p>
            <strong className={classes.method}>Yum:</strong>
            <code className={classes.managerCode}>
              {this.renderLinuxPackageManagerCommand(Platform.PACKAGE_MANAGERS.YUM)}
            </code>
          </p>
        ) : undefined}
        {exclude !== Platform.PACKAGE_MANAGERS.ZYPPER ? (
          <p>
            <strong className={classes.method}>Zypper:</strong>
            <code className={classes.managerCode}>
              {this.renderLinuxPackageManagerCommand(Platform.PACKAGE_MANAGERS.ZYPPER)}
            </code>
          </p>
        ) : undefined}
      </React.Fragment>
    )
  }

  /**
  * Renders the message for the given provider
  * @param classes: the classes
  * @param provider: the provider giving the updates
  * @param showAllPackageManagerCommands: true to show all pacakge manager commands
  * @param installMethod: the install method that was used
  * @param osPackageManager: the package manager used by the os
  * @return jsx
  */
  renderMessage (classes, provider, showAllPackageManagerCommands, installMethod, osPackageManager) {
    if (provider === 'squirrel') {
      return (
        <p>A new version of Wavebox has been downloaded and is ready to install. Do you want to install it now?</p>
      )
    } else if (provider === 'manual') {
      if (process.platform === 'linux') {
        if (osPackageManager === Platform.PACKAGE_MANAGERS.UNKNOWN || !osPackageManager) {
          return (
            <div>
              <p>A newer version of Wavebox is now available.</p>
              <p>
                Depending on how you installed Wavebox you may be able to update using your package
                manager, alternatively you can download the latest version using your web browser
              </p>
              {this.renderAllLinuxPackageManagerCommands(classes)}
            </div>
          )
        } else if (osPackageManager === Platform.PACKAGE_MANAGERS.SNAP) {
          return (
            <div>
              <p>A newer version of Wavebox is now available. You can update using your package manager:</p>
              <code className={classNames(classes.managerCode, classes.managerCodeFullWidth)}>
                {this.renderLinuxPackageManagerCommand(osPackageManager)}
              </code>
            </div>
          )
        } else {
          return (
            <div>
              <p>A newer version of Wavebox is now available.</p>
              <p>
                If you installed Wavebox with your package manager, you can use this to update. Alternatively
                you can download that latest version using your web browser
              </p>
              <code className={classNames(classes.managerCode, classes.managerCodeFullWidth)}>
                {this.renderLinuxPackageManagerCommand(osPackageManager)}
              </code>
              {!showAllPackageManagerCommands ? (
                <Button
                  variant='outlined'
                  size='small'
                  className={classes.showAllPackageManagersButton}
                  onClick={this.handleShowAllPackageManagerCommands}>
                  Other package managers
                </Button>
              ) : (
                this.renderAllLinuxPackageManagerCommands(classes, osPackageManager)
              )}
            </div>
          )
        }
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
      location,
      classes
    } = this.props
    const {
      showAllPackageManagerCommands
    } = this.state
    const {
      installMethod = DistributionConfig.installMethod,
      osPackageManager = Platform.PACKAGE_MANAGERS.UNKNOWN
    } = querystring.parse(location.search.substr(1))

    return (
      <React.Fragment>
        <UpdateModalTitle />
        <DialogContent className={classes.dialogContent}>
          {this.renderMessage(
            classes,
            provider,
            showAllPackageManagerCommands,
            installMethod,
            osPackageManager
          )}
          <p className={classes.changelogLink} onClick={this.handleOpenChangelog}>
            See what's new in this release
          </p>
        </DialogContent>
        {this.renderActions(classes, provider)}
      </React.Fragment>
    )
  }
}

export default UpdateAvailableSceneContent
