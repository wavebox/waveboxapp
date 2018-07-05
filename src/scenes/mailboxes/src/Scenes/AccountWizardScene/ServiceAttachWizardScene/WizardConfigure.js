import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import WizardConfigureGeneric from '../Common/WizardConfigure/WizardConfigureGeneric'
import WizardConfigureGmail from '../Common/WizardConfigure/WizardConfigureGmail'
import WizardConfigureGinbox from '../Common/WizardConfigure/WizardConfigureGinbox'
import WizardConfigureMicrosoft from '../Common/WizardConfigure/WizardConfigureMicrosoft'
import WizardConfigureContainer from '../Common/WizardConfigure/WizardConfigureContainer'
import WizardConfigureDefaultLayout from '../Common/WizardConfigure/WizardConfigureDefaultLayout'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

export default class WizardConfigure extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
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
        serviceType: (accountStore.getState().getService(nextProps.serviceId) || {}).type
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    serviceType: (accountStore.getState().getService(this.props.serviceId) || {}).type
  }

  accountUpdated = (accountState) => {
    this.setState({
      serviceType: (accountState.getService(this.props.serviceId) || {}).type
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { onRequestCancel, serviceId, ...passProps } = this.props
    const { serviceType } = this.state

    let RenderClass
    switch (serviceType) {
      case SERVICE_TYPES.GENERIC:
        RenderClass = WizardConfigureGeneric
        break
      case SERVICE_TYPES.GOOGLE_MAIL:
        RenderClass = WizardConfigureGmail
        break
      case SERVICE_TYPES.GOOGLE_INBOX:
        RenderClass = WizardConfigureGinbox
        break
      case SERVICE_TYPES.MICROSOFT_MAIL:
        RenderClass = WizardConfigureMicrosoft
        break
      case SERVICE_TYPES.CONTAINER:
        RenderClass = WizardConfigureContainer
        break
      default:
        RenderClass = WizardConfigureDefaultLayout
        break
    }

    return (<RenderClass onRequestCancel={onRequestCancel} serviceId={serviceId} {...passProps} />)
  }
}
