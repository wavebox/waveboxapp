import React from 'react'
import { IconButton, FontIcon } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import styles from './SidelistStyles'
import { basicPopoverStyles } from './SidelistPopoverStyles'
import ReactPortalTooltip from 'react-portal-tooltip'
import uuid from 'uuid'

export default class SidelistItemWizard extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      generatedId: uuid.v4(),
      showTooltip: false
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const { style, ...passProps } = this.props
    const { generatedId, showTooltip } = this.state

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, style)}
        onMouseEnter={() => this.setState({ showTooltip: true })}
        onMouseLeave={() => this.setState({ showTooltip: false })}
        id={`ReactComponent-Sidelist-Item-Wizard-${generatedId}`}>
        <IconButton
          iconStyle={{ WebkitAppRegion: 'no-drag', fontSize: '24px', marginLeft: -4 }}
          onClick={() => { window.location.hash = '/app_wizard' }}>
          <FontIcon
            className='fa fa-fw fa-magic'
            color={Colors.yellow600}
            hoverColor={Colors.yellow200} />
        </IconButton>
        <ReactPortalTooltip
          active={showTooltip}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='right'
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Item-Wizard-${generatedId}`}>
          Setup Wizard
        </ReactPortalTooltip>
      </div>
    )
  }
}
