import React from 'react'
import { IconButton } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import styles from './SidelistStyles'
import { basicPopoverStyles } from './SidelistPopoverStyles'
import ReactPortalTooltip from 'react-portal-tooltip'
import uuid from 'uuid'

export default class SidelistItemPro extends React.Component {
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
        id={`ReactComponent-Sidelist-Item-Pro-${generatedId}`}>
        <IconButton
          iconClassName='fa fa-fw fa-diamond'
          onClick={() => { window.location.hash = '/pro' }}
          iconStyle={{ color: Colors.lightGreen200, fontSize: '24px', marginLeft: -4, WebkitAppRegion: 'no-drag' }} />
        <ReactPortalTooltip
          active={showTooltip}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='right'
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Item-Pro-${generatedId}`}>
          Wavebox Pro
        </ReactPortalTooltip>
      </div>
    )
  }
}
