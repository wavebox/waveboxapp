import React from 'react'
import { Dialog, RaisedButton } from 'material-ui'

export default class WmailImportCompleteScene extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return { open: true }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <RaisedButton label='Okay' primary onClick={this.handleClose} />
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
          <h2>WMail import complete</h2>
          <p>
            Your accounts and settings have been imported from WMail. You now need
            to re-authenticate your accounts with Wavebox to get started. To do this...
          </p>
          <ol>
            <li>
              <p>Right click on an account with red exclaimation</p>
            </li>
            <li>
              <p>Choose Reauthenticate & follow the on-screen prompts</p>
              <p>
                <img
                  src='../../images/wmail_import_reauth.png'
                  style={{
                    maxWidth: '100%',
                    maxHeight: 250,
                    width: 'auto',
                    height: 'auto',
                    boxShadow: '0 2px 10px 0 #c7c5c7'
                  }} />
              </p>
            </li>
          </ol>
        </div>
      </Dialog>
    )
  }
}
