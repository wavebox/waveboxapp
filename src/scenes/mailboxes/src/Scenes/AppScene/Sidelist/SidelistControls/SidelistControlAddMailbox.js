import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'

export default class SidelistControlAddMailbox extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <SidelistControl
        onClick={() => { window.location.hash = '/mailbox_wizard/add' }}
        tooltip='Add Account'
        icon={(
          <FontIcon
            className='material-icons'
            color={Colors.blueGrey400}
            hoverColor={Colors.blueGrey200}>
            add_circle
          </FontIcon>
        )} />
    )
  }
}
