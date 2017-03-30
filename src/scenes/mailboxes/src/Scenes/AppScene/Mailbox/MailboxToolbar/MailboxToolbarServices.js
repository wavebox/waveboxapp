const React = require('react')
const { mailboxStore } = require('stores/mailbox')
const MailboxToolbarService = require('./MailboxToolbarService')

const styles = {
  tabs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxToolbar',
  propTypes: { // sticky, check shouldComponentUpdate
    mailboxId: React.PropTypes.string.isRequired,
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
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.replaceState(this.getInitialState(nextProps))
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    const mailbox = mailboxStore.getState().getMailbox(props.mailboxId)
    return {
      serviceTypes: mailbox.enabledServiceTypes
    }
  },

  mailboxChanged (mailboxState) {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    this.setState({
      serviceTypes: mailbox.enabledServiceTypes
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.mailboxId !== nextProps.mailboxId) { return true }
    if (this.props.toolbarHeight !== nextProps.toolbarHeight) { return true }
    if (JSON.stringify(this.state.serviceTypes) !== JSON.stringify(nextState.serviceTypes)) { return true }

    return false
  },

  render () {
    const { mailboxId, toolbarHeight, style, ...passProps } = this.props
    const { serviceTypes } = this.state

    const saltedStyle = Object.assign({ height: toolbarHeight }, styles.tabs, style)

    return (
      <div {...passProps} style={saltedStyle}>
        {serviceTypes.map((serviceType) => {
          return (
            <MailboxToolbarService
              toolbarHeight={toolbarHeight}
              key={serviceType}
              mailboxId={mailboxId}
              serviceType={serviceType} />)
        })}
      </div>
    )
  }
})
