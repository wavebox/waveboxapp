import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Avatar } from 'material-ui'
import styles from '../SidelistStyles'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'

export default class SidelistItemMailboxService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    isActiveMailbox: PropTypes.bool.isRequired,
    isActiveService: PropTypes.bool.isRequired,
    onOpenService: PropTypes.func.isRequired,
    serviceType: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return { isHovering: false }
  })()

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
    const {
      mailbox,
      isActiveMailbox,
      isActiveService,
      serviceType,
      onOpenService,
      style,
      ...passProps
    } = this.props
    const { isHovering } = this.state
    const isActive = isActiveMailbox && isActiveService

    const borderColor = mailbox.showAvatarColorRing ? (
      isActive || isHovering ? mailbox.color : 'white'
    ) : 'transparent'
    const baseStyle = isActive || isHovering ? styles.mailboxServiceIconImageActive : styles.mailboxServiceIconImage
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
        style={Object.assign({}, style, { borderColor: borderColor }, baseStyle)} />
    )
  }
}
