const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const styles = require('../SidelistStyles')
const SidelistItemMailboxService = require('./SidelistItemMailboxService')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailboxServices',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    isActiveMailbox: React.PropTypes.bool.isRequired,
    activeService: React.PropTypes.string.isRequired,
    onOpenService: React.PropTypes.func.isRequired,
    onContextMenuService: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

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
})
