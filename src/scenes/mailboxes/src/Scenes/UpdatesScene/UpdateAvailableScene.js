import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, RaisedButton, FlatButton } from 'material-ui'
import { updaterActions, updaterStore } from 'stores/updater'
import UpdateModalTitle from './UpdateModalTitle'
import electron from 'electron'

const styles = {
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
  }
}

export default class UpdateAvailableScene extends React.Component {
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
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return { open: true }
  })()

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

  /* **************************************************************************/
  // UI Events: Squirrel
  /* **************************************************************************/

  /**
  * Installs the new update
  */
  handleSquirrelInstall = () => {
    this.handleClose()
    updaterActions.squirrelInstallUpdate()
  }

  /* **************************************************************************/
  // UI Events: Manual
  /* **************************************************************************/

  /**
  * Reprompts the user later on
  */
  handleCheckLater = () => {
    this.handleClose()
    updaterActions.scheduleNextUpdateCheck()
  }

  /**
  * Takes the user to the download page
  */
  handleDownloadManual = () => {
    this.handleClose()
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
  * @param provider: the provider giving the updates
  * @return jsx
  */
  renderActions (provider) {
    if (provider === 'squirrel') {
      return (
        <div>
          <FlatButton
            label='After Restart'
            style={{ marginRight: 16 }}
            onClick={this.handleClose} />
          <FlatButton
            label='Later'
            style={{ marginRight: 16 }}
            onClick={this.handleCheckLater} />
          <RaisedButton
            primary
            label='Install Now'
            onClick={this.handleSquirrelInstall} />
        </div>
      )
    } else if (provider === 'manual') {
      return (
        <div>
          <FlatButton
            label='After Restart'
            style={{ marginRight: 16 }}
            onClick={this.handleClose} />
          <FlatButton
            label='Later'
            style={{ marginRight: 16 }}
            onClick={this.handleCheckLater} />
          <RaisedButton
            primary
            label='Download Now'
            onClick={this.handleDownloadManual} />
        </div>
      )
    }
  }

  /**
  * Renders the message for the given provider
  * @param provider: the provider giving the updates
  * @return jsx
  */
  renderMessage (provider) {
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
            <br />
            <h4>
              If you installed using Snap
              <span style={{ fontWeight: 'normal' }}> you can use the following...</span>
            </h4>
            <code style={styles.managerCode}>
              {`sudo snap refresh wavebox`}
            </code>
            <br />
            <h4>
              If you installed using apt
              <span style={{ fontWeight: 'normal' }}> you can use the following...</span>
            </h4>
            <code style={styles.managerCode}>
              sudo apt update; sudo apt install wavebox
            </code>
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
    const { open } = this.state
    const { match: { params: { provider } } } = this.props

    return (
      <Dialog
        title={<UpdateModalTitle />}
        modal={false}
        actions={this.renderActions(provider)}
        open={open}
        onRequestClose={this.handleCheckLater}>
        {this.renderMessage(provider)}
      </Dialog>
    )
  }
}
