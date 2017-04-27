import React from 'react'
import { IconButton } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import styles from './SidelistStyles'
import { basicPopoverStyles } from './SidelistPopoverStyles'
import ReactPortalTooltip from 'react-portal-tooltip'
import uuid from 'uuid'

export default class SidelistItemAddMailbox extends React.Component {
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

  render () {
    const { style, ...passProps } = this.props
    const { showTooltip, generatedId } = this.state

    return (
      <div
        {...passProps}
        onMouseEnter={() => this.setState({ showTooltip: true })}
        onMouseLeave={() => this.setState({ showTooltip: false })}
        style={Object.assign({}, styles.itemContainer, style)}
        id={`ReactComponent-Sidelist-Item-Add-Mailbox-${generatedId}`}>
        <IconButton
          iconClassName='material-icons'
          onClick={() => { window.location.hash = '/mailbox_wizard/add' }}
          iconStyle={{ color: Colors.blueGrey400, WebkitAppRegion: 'no-drag' }}>
          add_circle
        </IconButton>
        <ReactPortalTooltip
          active={showTooltip}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='right'
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Item-Add-Mailbox-${generatedId}`}>
          Add Account
        </ReactPortalTooltip>
      </div>
    )
  }
}
