import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar } from 'material-ui'
import styles from '../SidelistStyles'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'

export default class SidelistItemMailboxService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    onOpenService: PropTypes.func.isRequired
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

  state = {
    ...this.generateState(),
    isHovering: false,
    globalShowSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator
  }

  generateState (props = this.props) {
    const { mailboxId, serviceType } = props
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(mailboxId)
    return {
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isSleeping: mailboxState.isSleeping(mailboxId, serviceType)
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    this.setState({
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(serviceType) : null,
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isSleeping: mailboxState.isSleeping(mailboxId, serviceType)
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

  /**
  * @param mailboxType: the type of mailbox
  * @param serviceType: the service type
  * @return the url of the service icon
  */
  getServiceIconUrl (mailboxType, serviceType) {
    const ServiceClass = ServiceFactory.getClass(mailboxType, serviceType)
    return ServiceClass ? '../../' + ServiceClass.humanizedLogo : ''
  }

  render () {
    const { mailboxId, serviceType, onOpenService, style, ...passProps } = this.props
    const {
      isHovering,
      isActive,
      isSleeping,
      mailbox,
      service,
      globalShowSleepableServiceIndicator
    } = this.state
    if (!mailbox || !service) { return false }

    const borderColor = mailbox.showAvatarColorRing ? (
      isActive || isHovering ? mailbox.color : 'white'
    ) : 'transparent'

    const baseStyle = isActive || isHovering ? styles.mailboxServiceIconImageActive : styles.mailboxServiceIconImage
    const showSleeping = isSleeping && mailbox.showSleepableServiceIndicator && globalShowSleepableServiceIndicator
    return (
      <Avatar
        {...passProps}
        src={this.getServiceIconUrl(mailbox.type, serviceType)}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        size={35}
        backgroundColor='white'
        draggable={false}
        onClick={(evt) => onOpenService(evt, serviceType)}
        style={{
          ...style,
          borderColor: borderColor,
          ...baseStyle,
          filter: showSleeping ? 'grayscale(100%)' : 'none'
        }} />
    )
  }
}
