import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../SidelistStyles'
import Color from 'color'
import { MailboxAvatar } from 'Components/Mailbox'
import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

export default class SidelistItemMailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isHovering: PropTypes.bool.isRequired,
    mailboxId: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)
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
    const mailbox = mailboxState.getMailbox(mailboxId)
    return {
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT) : null,
      isMailboxActive: mailboxState.activeMailboxId() === mailboxId,
      isDefaultServiceActive: mailboxState.isActive(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      isDefaultServiceSleeping: mailboxState.isSleeping(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      globalShowSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    this.setState({
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT) : null,
      isMailboxActive: mailboxState.activeMailboxId() === mailboxId,
      isDefaultServiceActive: mailboxState.isActive(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT),
      isDefaultServiceSleeping: mailboxState.isSleeping(mailboxId, CoreMailbox.SERVICE_TYPES.DEFAULT)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      globalShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isHovering, mailboxId, ...passProps } = this.props
    const {
      mailbox,
      service,
      isMailboxActive,
      isDefaultServiceActive,
      isDefaultServiceSleeping,
      globalShowSleepableServiceIndicator
    } = this.state

    if (!mailbox || !service) { return false }

    let borderColor
    let isSleeping
    if (mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR) {
      borderColor = isDefaultServiceActive || isHovering ? mailbox.color : Color(mailbox.color).lighten(0.4).rgb().string()
      isSleeping = isDefaultServiceSleeping
    } else {
      borderColor = isMailboxActive || isHovering ? mailbox.color : Color(mailbox.color).lighten(0.4).rgb().string()
      isSleeping = false
    }

    const showSleeping = isSleeping && service.showSleepableIndicator && globalShowSleepableServiceIndicator
    return (
      <MailboxAvatar
        {...passProps}
        mailbox={mailbox}
        size={42}
        style={Object.assign({
          boxShadow: `0 0 0 4px ${borderColor}`,
          margin: 4,
          filter: showSleeping ? 'grayscale(100%)' : 'none'
        }, styles.mailboxAvatar)} />
    )
  }
}
