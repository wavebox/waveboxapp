const React = require('react')
const { Dialog, RaisedButton, FlatButton } = require('material-ui')
const { wmailActions } = require('stores/wmail')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'WmailImportStartScene',

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { open: true }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose () {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  },

  /**
  * Imports the settings from wmail
  */
  handleImport () {
    wmailActions.importWmailSettings()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <FlatButton label='Cancel' onClick={this.handleClose} />
        <RaisedButton label='Import' primary onClick={this.handleImport} />
      </div>
    )

    return (
      <Dialog
        modal={false}
        actions={actions}
        open={open}
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <div style={{ textAlign: 'center' }}>
          <p>
            <img
              src='../../images/wmail_import.png'
              style={{ maxWidth: '100%', maxHeight: 150, width: 'auto', height: 'auto' }}
            />
          </p>
          <h2>Wavebox can import most settings from WMail</h2>
          <p>Do you want to import your WMail settings?</p>
        </div>
      </Dialog>
    )
  }
})
