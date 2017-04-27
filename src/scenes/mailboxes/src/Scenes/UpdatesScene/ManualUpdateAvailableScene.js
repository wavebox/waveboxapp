import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, RaisedButton, FlatButton } from 'material-ui'
import { updaterActions, updaterStore } from 'stores/updater'
const { remote: {shell} } = window.nativeRequire('electron')

export default class ManualUpdateAvailableScene extends React.Component {
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
  handleClose () {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  }

  /**
  * Doesn't re-prompt the user until after they restart the app
  */
  handleAfterRestart = () => {
    this.handleClose()
  }

  /**
  * Reprompts the user later on
  */
  handleLater = () => {
    this.handleClose()
    updaterActions.scheduleNextUpdateCheck()
  }

  /**
  * Takes the user to the download page
  */
  handleDownload = () => {
    this.handleClose()
    const url = updaterStore.getState().lastManualDownloadUrl
    if (url) {
      shell.openExternal(url)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <FlatButton
          label='After Restart'
          style={{ marginRight: 16 }}
          onClick={this.handleAfterRestart} />
        <FlatButton
          label='Later'
          style={{ marginRight: 16 }}
          onClick={this.handleLater} />
        <RaisedButton
          primary
          label='Download Now'
          onClick={this.handleDownload} />
      </div>
    )

    return (
      <Dialog modal={false} actions={actions} open={open} onRequestClose={this.handleLater}>
        <p>A newer version of Wavebox is now available. Do you want to download it now?</p>
      </Dialog>
    )
  }
}
