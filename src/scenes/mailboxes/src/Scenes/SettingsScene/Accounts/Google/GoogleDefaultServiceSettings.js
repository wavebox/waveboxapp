import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceSection from '../ServiceSection'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'
import GoogleUnreadSettings from './GoogleUnreadSettings'

export default class GoogleDefaultServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailbox,
      onRequestEditCustomCode,
      ...passProps
    } = this.props

    const serviceType = GoogleDefaultService.SERVICE_TYPES.DEFAULT
    const service = mailbox.serviceForType(serviceType)

    return (
      <ServiceSection {...passProps} mailbox={mailbox} serviceType={serviceType}>
        <GoogleUnreadSettings mailbox={mailbox} service={service} />
        <ServiceBadgeSettingsSection mailbox={mailbox} service={service} />
        <ServiceNotificationSettingsSection mailbox={mailbox} service={service} />
        <ServiceBehaviourSettingsSection mailbox={mailbox} service={service} />
        <ServiceCustomCodeSettingsSection
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode} />
      </ServiceSection>
    )
  }
}
