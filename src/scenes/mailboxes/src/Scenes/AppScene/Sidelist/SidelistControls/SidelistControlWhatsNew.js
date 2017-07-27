import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'

export default class SidelistControlWhatsNew extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <SidelistControl
        onClick={() => { }}
        tooltip={`What's new`}
        iconStyle={{ fontSize: '24px', marginLeft: -4 }}
        icon={(
          <FontIcon
            className='fa fa-fw fa-star-o'
            color={Colors.red400}
            hoverColor={Colors.red100} />
        )} />
    )
  }
}
