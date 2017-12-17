import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'
import { TOUR_STEPS } from 'stores/settings/Tour'

export default class SidelistControlExpander extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <SidelistControl
        onClick={this.props.onClick}
        tooltip={this.props.expanded ? 'Hide' : 'Show'}
        tourStep={TOUR_STEPS.EXPANDER}
        tourTooltip={(
          <div>
            Click here to hide/show the controls.
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
            {this.props.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          </FontIcon>
        )} />
    )
  }
}
