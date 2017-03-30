const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { mailboxStore, mailboxActions } = require('stores/mailbox')
const ReactPortalTooltip = require('react-portal-tooltip')
const { basicPopoverStyles } = require('./ToolbarPopoverStyles')
const uuid = require('uuid')

const styles = {
  tab: {
    cursor: 'pointer',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    position: 'relative'
  },
  avatar: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain'
  },
  tooltipContent: {
    whiteSpace: 'nowrap'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxToolbarService',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired,
    serviceType: React.PropTypes.string.isRequired,
    toolbarHeight: React.PropTypes.number.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
      const { mailboxId, serviceType } = nextProps
      this.setState(this.generateStateFromMailbox(mailboxStore.getState(), mailboxId, serviceType))
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    const { mailboxId, serviceType } = this.props
    return Object.assign({
      isHovering: false,
      generatedId: uuid.v4()
    }, this.generateStateFromMailbox(mailboxStore.getState(), mailboxId, serviceType))
  },

  mailboxChanged (mailboxState) {
    const { mailboxId, serviceType } = this.props
    this.setState(this.generateStateFromMailbox(mailboxState, mailboxId, serviceType))
  },

  /**
  * Generates the state from a mailbox
  * @param mailboxState: the current mailbox state to use
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of the service
  */
  generateStateFromMailbox (mailboxState, mailboxId, serviceType) {
    const mailbox = mailboxState.getMailbox(mailboxId)
    if (mailbox) {
      return {
        mailboxAvailable: true,
        isActive: mailboxState.isActive(mailboxId, serviceType),
        service: mailbox.serviceForType(serviceType)
      }
    } else {
      return {
        mailboxAvailable: false
      }
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the service being clicked
  */
  handleServiceClicked (evt) {
    evt.preventDefault()
    mailboxActions.changeActive(this.props.mailboxId, this.props.serviceType)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { toolbarHeight, ...passProps } = this.props
    delete passProps.mailboxId
    delete passProps.serviceType
    const { isHovering, isActive, service, generatedId, mailboxAvailable } = this.state

    if (!mailboxAvailable) { return false }

    const elementId = `ReactComponent-Toolbar-Item-${generatedId}`
    return (
      <div
        style={Object.assign({
          borderBottomColor: isActive || isHovering ? 'white' : 'transparent',
          backgroundColor: isActive ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
          height: toolbarHeight,
          width: toolbarHeight
        }, styles.tab)}
        id={elementId}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}
        onClick={this.handleServiceClicked}>
        <div
          style={Object.assign({ backgroundImage: `url("../../${service.humanizedLogo}")` }, styles.avatar)} />
        <ReactPortalTooltip
          active={isHovering}
          tooltipTimeout={0}
          style={basicPopoverStyles}
          position='bottom'
          arrow='top'
          group={elementId}
          parent={`#${elementId}`}>
          <span style={styles.tooltipContent}>
            {service.humanizedType}
          </span>
        </ReactPortalTooltip>
      </div>
    )
  }
})
