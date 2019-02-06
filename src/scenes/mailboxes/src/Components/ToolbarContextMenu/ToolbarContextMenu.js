import PropTypes from 'prop-types'
import React from 'react'
import { Menu } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import ToolbarContextMenuContent from './ToolbarContextMenuContent'

class ToolbarContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    anchorPosition: PropTypes.shape({
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    }),
    onRequestClose: PropTypes.func.isRequired,
    location: PropTypes.oneOf(['sidebar', 'toolbar']).isRequired,
    mailboxId: PropTypes.string
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evt: the event that fired
  * @param callback=undefined: executed on completion
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
      anchorPosition,
      location,
      mailboxId
    } = this.props

    return (
      <Menu
        open={isOpen}
        anchorEl={anchor}
        anchorPosition={anchorPosition}
        anchorReference='anchorPosition'
        MenuListProps={{ dense: true }}
        disableEnforceFocus
        disableAutoFocusItem
        onClose={this.closePopover}>
        <ToolbarContextMenuContent
          onRequestClose={this.closePopover}
          location={location}
          mailboxId={mailboxId} />
      </Menu>
    )
  }
}

export default ToolbarContextMenu
