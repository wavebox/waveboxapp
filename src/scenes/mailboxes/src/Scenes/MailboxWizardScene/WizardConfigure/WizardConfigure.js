import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import WizardConfigureGeneric from './WizardConfigureGeneric'
import WizardConfigureGmail from './WizardConfigureGmail'
import WizardConfigureGinbox from './WizardConfigureGinbox'
import { ACCOUNT_TEMPLATE_TYPES } from 'shared/Models/ACAccounts/AccountTemplates'
/*
import WizardConfigureMicrosoft from './WizardConfigureMicrosoft'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import WizardConfigureContainer from './WizardConfigureContainer'*/

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
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState({
        templateType: (accountStore.getState().getMailbox(nextProps.mailboxId) || {}).templateType
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    templateType: (accountStore.getState().getMailbox(this.props.mailboxId) || {}).templateType
  }

  accountUpdated = (accountState) => {
    this.setState({
      templateType: (accountState.getMailbox(this.props.mailboxId) || {}).templateType
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { onRequestCancel, mailboxId, ...passProps } = this.props
    const { templateType } = this.state

    let RenderClass
    switch (templateType) {
      case ACCOUNT_TEMPLATE_TYPES.GENERIC:
        RenderClass = WizardConfigureGeneric
        break
      case ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL:
        RenderClass = WizardConfigureGmail
        break
      case ACCOUNT_TEMPLATE_TYPES.GOOGLE_INBOX:
        RenderClass = WizardConfigureGinbox
        break
      case ACCOUNT_TEMPLATE_TYPES.SLACK:
        //TODO
        break
      case ACCOUNT_TEMPLATE_TYPES.TRELLO:
        //TODO
        break
      case ACCOUNT_TEMPLATE_TYPES.MICROSOFT:
        //TODO
        break
      case ACCOUNT_TEMPLATE_TYPES.CONTAINER:
        //TODO
        break
    }
    if (RenderClass) {
      return <RenderClass onRequestCancel={onRequestCancel} mailboxId={mailboxId} {...passProps} />
    }

    return false

    /*if (mailbox) {
      if (mailbox.type === GoogleMailbox.type) {
        if (mailbox.defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
          return (
            <WizardConfigureGmail onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
        } else if (mailbox.defaultService.accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
          return (
            <WizardConfigureGinbox onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
        }
      } else if (mailbox.type === MicrosoftMailbox.type) {
        return (
          <WizardConfigureMicrosoft onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
      } else if (mailbox.type === GenericMailbox.type) {
        return (
          <WizardConfigureGeneric onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />)
      } else if (mailbox.type === ContainerMailbox.type) {
        return (
          <WizardConfigureContainer onRequestCancel={onRequestCancel} mailbox={mailbox} {...passProps} />
        )
      }
    }*/
  }
}
