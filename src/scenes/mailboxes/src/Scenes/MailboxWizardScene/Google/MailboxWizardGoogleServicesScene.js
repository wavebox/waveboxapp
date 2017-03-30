const React = require('react')
const MailboxWizardServicesScene = require('../MailboxWizardServicesScene')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxWizardGoogleServicesScene',
  propTypes: {
    params: React.PropTypes.shape({
      mailboxId: React.PropTypes.string.isRequired
    })
  },
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <MailboxWizardServicesScene nextUrl='/mailbox_wizard/complete' mailboxId={this.props.params.mailboxId} />
    )
  }
})
