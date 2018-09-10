import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import WizardConfigureGeneric from '../../Common/WizardConfigure/WizardConfigureGeneric'
import WizardConfigureGmail from '../../Common/WizardConfigure/WizardConfigureGmail'
import WizardConfigureGinbox from '../../Common/WizardConfigure/WizardConfigureGinbox'
import WizardConfigureMicrosoft from '../../Common/WizardConfigure/WizardConfigureMicrosoft'
import WizardConfigureContainer from '../../Common/WizardConfigure/WizardConfigureContainer'
import WizardConfigureDefaultLayout from '../../Common/WizardConfigure/WizardConfigureDefaultLayout'
import { ACCOUNT_TEMPLATE_TYPES } from 'shared/Models/ACAccounts/AccountTemplates'

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
      const mailbox = accountStore.getState().getMailbox(nextProps.mailboxId)
      this.setState(mailbox ? {
        serviceId: mailbox.allServices[0],
        templateType: mailbox.templateType
      } : {
        serviceId: undefined,
        templateType: undefined
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailbox = accountStore.getState().getMailbox(this.props.mailboxId)
    return mailbox ? {
      serviceId: mailbox.allServices[0],
      templateType: mailbox.templateType
    } : {
      serviceId: undefined,
      templateType: undefined
    }
  })()

  accountUpdated = (accountState) => {
    const mailbox = accountState.getMailbox(this.props.mailboxId)
    this.setState(mailbox ? {
      serviceId: mailbox.allServices[0],
      templateType: mailbox.templateType
    } : {
      serviceId: undefined,
      templateType: undefined
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { onRequestCancel, mailboxId, ...passProps } = this.props
    const { templateType, serviceId } = this.state
    if (!serviceId) { return false }

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
      case ACCOUNT_TEMPLATE_TYPES.OUTLOOK:
      case ACCOUNT_TEMPLATE_TYPES.OFFICE365:
        RenderClass = WizardConfigureMicrosoft
        break
      case ACCOUNT_TEMPLATE_TYPES.CONTAINER:
        RenderClass = WizardConfigureContainer
        break
      default:
        RenderClass = WizardConfigureDefaultLayout
        break
    }

    return (<RenderClass onRequestCancel={onRequestCancel} serviceId={serviceId} {...passProps} />)
  }
}
