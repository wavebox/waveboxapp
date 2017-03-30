const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Dialog, RaisedButton, FlatButton } = require('material-ui')
const { updaterActions } = require('stores/updater')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SquirrelUpdateDownloadedScene',

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { open: true }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose () {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  },

  /**
  * Doesn't re-prompt the user until after they restart the app
  */
  handleAfterRestart () {
    this.handleClose()
  },

  /**
  * Installs the new update
  */
  handleInstall () {
    this.handleClose()
    updaterActions.squirrelInstallUpdate()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <FlatButton
          label='After Restart'
          style={{ marginRight: 16 }}
          onClick={this.handleAfterRestart} />
        <RaisedButton
          primary
          label='Install Now'
          onClick={this.handleInstall} />
      </div>
    )

    return (
      <Dialog modal={false} actions={actions} open={open} onRequestClose={this.handleLater}>
        <p>A new version of Wavebox has been downloaded an is ready to install. Do you want to install it now?</p>
      </Dialog>
    )
  }
})
