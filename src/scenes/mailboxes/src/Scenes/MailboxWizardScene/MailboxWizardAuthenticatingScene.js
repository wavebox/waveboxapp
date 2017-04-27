import React from 'react'
import { Dialog, CircularProgress } from 'material-ui'

export default class MailboxWizardAuthenticatingScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <Dialog
        modal
        open
        contentStyle={{ width: 180, transition: 'none' }}
        style={{ transition: 'none' }}
        overlayStyle={{ transition: 'none' }}>
        <CircularProgress
          size={80}
          thickness={5}
          style={{ display: 'block', margin: '0px auto' }} />
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          Just a moment...
        </div>
      </Dialog>
    )
  }
}
