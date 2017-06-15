import React from 'react'
import { IconButton, FontIcon } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import styles from './SidelistStyles'
import { basicPopoverStyles } from './SidelistPopoverStyles'
import ReactPortalTooltip from 'react-portal-tooltip'
import uuid from 'uuid'

export default class SidelistItemSettings extends React.Component {
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
    const { showTooltip, generatedId } = this.state

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, style)}
        onMouseEnter={() => this.setState({ showTooltip: true })}
        onMouseLeave={() => this.setState({ showTooltip: false })}
        id={`ReactComponent-Sidelist-Item-Settings-${generatedId}`}>
        <IconButton
          iconStyle={{ WebkitAppRegion: 'no-drag' }}
          onClick={() => { window.location.hash = '/settings' }}>
          <FontIcon
            className='material-icons'
            style={{ WebkitAppRegion: 'no-drag' }}
            color={Colors.blueGrey400}
            hoverColor={Colors.blueGrey200}>
            settings
          </FontIcon>
        </IconButton>
        <ReactPortalTooltip
          active={showTooltip}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='right'
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Item-Settings-${generatedId}`}>
          Settings
        </ReactPortalTooltip>
      </div>
    )
  }
}
