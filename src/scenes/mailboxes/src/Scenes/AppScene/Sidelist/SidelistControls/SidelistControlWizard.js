import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'

export default class SidelistControlWizard extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <SidelistControl
        onClick={() => { window.location.hash = '/app_wizard' }}
        tooltip='Setup Wizard'
        iconStyle={{ fontSize: '24px', marginLeft: -4 }}
        icon={(
          <FontIcon
            className='fa fa-fw fa-magic'
            color={Colors.amber600}
            hoverColor={Colors.amber200} />
        )} />
    )
  }
}
