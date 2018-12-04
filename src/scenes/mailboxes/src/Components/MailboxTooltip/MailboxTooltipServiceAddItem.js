import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import TooltipSectionListItem from 'wbui/TooltipSectionListItem'
import TooltipSectionListItemIcon from 'wbui/TooltipSectionListItemIcon'
import TooltipSectionListItemText from 'wbui/TooltipSectionListItemText'

class MailboxTooltipServiceAddItem extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <TooltipSectionListItem button {...this.props}>
        <TooltipSectionListItemIcon>
          <LibraryAddIcon />
        </TooltipSectionListItemIcon>
        <TooltipSectionListItemText inset primary='Add another service' />
      </TooltipSectionListItem>
    )
  }
}

export default MailboxTooltipServiceAddItem
