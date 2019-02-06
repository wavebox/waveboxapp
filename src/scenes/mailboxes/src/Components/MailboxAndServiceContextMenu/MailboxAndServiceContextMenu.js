import PropTypes from 'prop-types'
import React from 'react'
import { Menu } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxAndServiceContextMenuContent from './MailboxAndServiceContextMenuContent'

export default class MailboxAndServiceContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evt: the event that fired
  */
  closePopover = (evt) => {
    if (evt) {
      evt.preventDefault()
      evt.stopPropagation()
    }
    this.props.onRequestClose()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      isOpen,
      anchor,
      mailboxId,
      serviceId
    } = this.props

    return (
      <Menu
        open={isOpen}
        anchorEl={anchor}
        MenuListProps={{ dense: true }}
        disableEnforceFocus
        disableAutoFocusItem
        onClose={this.closePopover}>
        <MailboxAndServiceContextMenuContent
          mailboxId={mailboxId}
          serviceId={serviceId}
          onRequestClose={this.closePopover} />
      </Menu>
    )
  }
}
