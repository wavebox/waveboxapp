import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'

export default class SidelistControlSupport extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <SidelistControl
        onClick={() => { window.location.hash = '/settings/support' }}
        tooltip={`Help, Support & FAQs`}
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
