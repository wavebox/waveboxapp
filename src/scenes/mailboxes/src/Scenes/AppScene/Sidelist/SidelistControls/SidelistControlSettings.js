import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'
import { TOUR_STEPS } from 'stores/settings/Tour'

export default class SidelistControlSettings extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <SidelistControl
        onClick={() => { window.location.hash = '/settings' }}
        tooltip='Settings'
        tourStep={TOUR_STEPS.SETTINGS}
        tourTooltip={(
          <div>
            Click here to open the Wavebox Settings and<br />
            make sure Wavebox works best for you
          </div>
        )}
        tourTooltipStyles={{
          style: { marginTop: -25 },
          arrowStyle: { marginTop: 20 }
        }}
        icon={(
          <FontIcon
            className='material-icons'
            color={Colors.blueGrey400}
            hoverColor={Colors.blueGrey200}>
            settings
          </FontIcon>
        )} />
    )
  }
}
