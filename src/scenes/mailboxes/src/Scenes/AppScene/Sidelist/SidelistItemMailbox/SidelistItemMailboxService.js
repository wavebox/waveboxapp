const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Avatar } = require('material-ui')
const styles = require('../SidelistStyles')
const ServiceFactory = require('shared/Models/Accounts/ServiceFactory')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailboxServices',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    isActiveMailbox: React.PropTypes.bool.isRequired,
    isActiveService: React.PropTypes.bool.isRequired,
    onOpenService: React.PropTypes.func.isRequired,
    serviceType: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { isHovering: false }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * @param mailboxType: the type of mailbox
  * @param serviceType: the service type
  * @return the url of the service icon
  */
  getServiceIconUrl (mailboxType, serviceType) {
    const ServiceClass = ServiceFactory.getClass(mailboxType, serviceType)
    return ServiceClass ? '../../' + ServiceClass.humanizedLogo : ''
  },

  render () {
    const { mailbox, isActiveMailbox, isActiveService, serviceType, onOpenService, ...passProps } = this.props
    const { isHovering } = this.state
    const isActive = isActiveMailbox && isActiveService

    const borderColor = isActive || isHovering ? mailbox.color : 'white'
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
        style={Object.assign({ borderColor: borderColor }, baseStyle)} />
    )
  }
})
