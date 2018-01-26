import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'
import { TOUR_STEPS } from 'stores/settings/Tour'

export default class SidelistControlSupport extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <SidelistControl
        className={`WB-SidelistControlSupport`}
        onClick={() => { window.location.hash = '/settings/support' }}
        tooltip={`Help, Support & FAQs`}
        tourStep={TOUR_STEPS.SUPPORT_CENTER}
        tourTooltip={(
          <div>
            Click here to get support, find answers to<br />
            the most commonly asked questions and get<br />
            involved with the Wavebox community
          </div>
        )}
        iconStyle={{ fontSize: '28px', marginLeft: -6 }}
        icon={(
          <FontIcon
            className='fa fa-fw fa-question-circle-o'
            color={Colors.teal600}
            hoverColor={Colors.teal200} />
        )} />
    )
  }
}
