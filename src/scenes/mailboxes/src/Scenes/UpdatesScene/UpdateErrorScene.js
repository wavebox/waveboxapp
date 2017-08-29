import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, RaisedButton, FlatButton } from 'material-ui'
import { updaterActions, updaterStore } from 'stores/updater'
import UpdateModalTitle from './UpdateModalTitle'
import * as Colors from 'material-ui/styles/colors'
const { remote: {shell} } = window.nativeRequire('electron')
const pkg = window.appPackage()

export default class UpdateErrorScene extends React.Component {
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
    shell.openExternal(updaterStore.getState().getManualUpdateDownloadUrl())
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
  * @param provider: the provider user to action the update
  * @param tries: the download tries
  * @return jsx
  */
  renderMessage (provider, tries) {
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
    const { match: { params: { provider } } } = this.props

    const actions = (
      <div>
        <FlatButton
          label='Retry later'
          style={{ marginRight: 16 }}
          onClick={this.handleCheckLater} />
        <FlatButton
          label='Download Manually'
          style={{ marginRight: 16 }}
          onClick={this.handleDownloadManually} />
        <RaisedButton
          primary
          label='Try again'
          onClick={this.handleCheckAgain} />
      </div>
    )

    return (
      <Dialog
        title={(<UpdateModalTitle text='Update Error' color={Colors.red900} iconName='error' />)}
        modal={false}
        actions={actions}
        open={open}
        onRequestClose={this.handleCheckLater}>
        {this.renderMessage(provider, updateFailedCount)}
        <p style={{ fontSize: '85%' }}>
          You're currently using Wavebox version <strong>{pkg.version}</strong>
        </p>
      </Dialog>
    )
  }
}
