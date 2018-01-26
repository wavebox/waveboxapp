import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'
import { TOUR_STEPS } from 'stores/settings/Tour'

export default class SidelistControlAddMailbox extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <SidelistControl
        className={`WB-SidelistControlAddMailbox`}
        onClick={() => { window.location.hash = '/mailbox_wizard/add' }}
        tooltip='Add Account'
        tourStep={TOUR_STEPS.ADD_ACCOUNT}
        tourTooltip={(
          <div>
            Click here to add your next account and take<br />
            full advantage of everything Wavebox has to offer
          </div>
        )}
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
