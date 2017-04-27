import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../SidelistStyles'
import SidelistItemMailboxService from './SidelistItemMailboxService'

export default class SidelistItemMailboxServices extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    isActiveMailbox: PropTypes.bool.isRequired,
    activeService: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired,
    onContextMenuService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailbox,
      isActiveMailbox,
      activeService,
      onOpenService,
      onContextMenuService
    } = this.props
    if (!mailbox.hasAdditionalServices) { return null }

    const style = Object.assign({},
      styles.mailboxServiceIcons,
      mailbox.collapseSidebarServices && !isActiveMailbox ? styles.mailboxServiceIconsCollapsed : undefined
    )

    return (
      <div style={style}>
        {mailbox.additionalServiceTypes.map((serviceType) => {
          return (
            <SidelistItemMailboxService
              key={serviceType}
              onContextMenu={(evt) => onContextMenuService(evt, serviceType)}
              mailbox={mailbox}
              isActiveMailbox={isActiveMailbox}
              isActiveService={activeService === serviceType}
              onOpenService={onOpenService}
              serviceType={serviceType} />
          )
        })}
      </div>
    )
  }
}
