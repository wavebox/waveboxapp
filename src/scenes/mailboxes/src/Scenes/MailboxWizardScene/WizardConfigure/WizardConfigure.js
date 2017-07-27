import React from 'react'
import PropTypes from 'prop-types'
import { mailboxStore } from 'stores/mailbox'
import GoogleMailbox from 'shared/Models/Accounts/Google/GoogleMailbox'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import MicrosoftMailbox from 'shared/Models/Accounts/Microsoft/MicrosoftMailbox'
import GenericMailbox from 'shared/Models/Accounts/Generic/GenericMailbox'
import WizardConfigureGmail from './WizardConfigureGmail'
import WizardConfigureGinbox from './WizardConfigureGinbox'
import WizardConfigureMicrosoft from './WizardConfigureMicrosoft'
import WizardConfigureGeneric from './WizardConfigureGeneric'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'

export default class WizardConfigure extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState({
        mailbox: mailboxStore.getState().getMailbox(nextProps.mailboxId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    mailbox: mailboxStore.getState().getMailbox(this.props.mailboxId)
  }

  mailboxUpdated = (mailboxState) => {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.mailboxId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { onRequestCancel, mailboxId, ...passProps } = this.props
    const { mailbox } = this.state

    if (mailbox) {
      if (mailbox.type === GoogleMailbox.type) {
        if (mailbox.defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
          return (<WizardConfigureGmail onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
        } else if (mailbox.defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
          return (<WizardConfigureGinbox onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
        }
      } else if (mailbox.type === MicrosoftMailbox.type) {
        return (<WizardConfigureMicrosoft onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
      } else if (mailbox.type === GenericMailbox.type) {
        return (<WizardConfigureGeneric onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
      }
    }

    // Catch-all we should never really get here
    return (<WizardConfigureDefaultLayout onRequestCancel={onRequestCancel} mailboxId={mailboxId} {...passProps} />)
  }
}
