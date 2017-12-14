import React from 'react'
import { Dialog } from 'material-ui'
import Spinner from 'sharedui/Components/Activity/Spinner'
import * as Colors from 'material-ui/styles/colors'

export default class AccountAuthenticatingScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <Dialog
        modal
        open
        contentStyle={{ width: 180, transition: 'none', textAlign: 'center' }}
        style={{ transition: 'none' }}
        overlayStyle={{ transition: 'none' }}>
        <Spinner size={50} color={Colors.lightBlue600} speed={0.75} />
        <div style={{ marginTop: 20 }}>
          Just a moment...
        </div>
      </Dialog>
    )
  }
}
