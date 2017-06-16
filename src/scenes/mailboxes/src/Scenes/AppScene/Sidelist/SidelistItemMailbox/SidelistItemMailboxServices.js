import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../SidelistStyles'
import SidelistItemMailboxService from './SidelistItemMailboxService'
import { mailboxStore } from 'stores/mailbox'

export default class SidelistItemMailboxServices extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired,
    onContextMenuService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  state = this.generateState()

  generateState (props = this.props) {
    const { mailboxId } = props
    const mailboxState = mailboxStore.getState()
    return {
      mailbox: mailboxState.getMailbox(mailboxId),
      isActiveMailbox: mailboxState.activeMailboxId() === mailboxId
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId } = this.props
    this.setState({
      mailbox: mailboxState.getMailbox(mailboxId),
      isActiveMailbox: mailboxState.activeMailboxId() === mailboxId
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      onOpenService,
      onContextMenuService
    } = this.props
    const { mailbox, isActiveMailbox } = this.state
    if (!mailbox || !mailbox.hasAdditionalServices) { return false }

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
              mailboxId={mailbox.id}
              serviceType={serviceType}
              onOpenService={onOpenService}
              onContextMenu={(evt) => onContextMenuService(evt, serviceType)} />
          )
        })}
      </div>
    )
  }
}
