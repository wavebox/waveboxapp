import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceSection from '../ServiceSection'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'

export default class GoogleServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    serviceType: PropTypes.string.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the content
  * @param mailbox: the mailbox to render for
  * @param service: the servie to render for
  * @param onRequestEditCustomCode: the custom code editing fn
  * @return jsx
  */
  renderContent (mailbox, service, onRequestEditCustomCode) {
    if (!service) { return undefined }

    if (ServiceBadgeSettingsSection.willRenderForService(service) || ServiceNotificationSettingsSection.willRenderForService(service)) {
      return (
        <div>
          <ServiceBadgeSettingsSection mailbox={mailbox} service={service} />
          <ServiceNotificationSettingsSection mailbox={mailbox} service={service} />
          <ServiceBehaviourSettingsSection mailbox={mailbox} service={service} />
          <ServiceCustomCodeSettingsSection
            mailbox={mailbox}
            service={service}
            onRequestEditCustomCode={onRequestEditCustomCode} />
        </div>
      )
    } else {
      return (
        <div>
          <ServiceBehaviourSettingsSection mailbox={mailbox} service={service} />
          <ServiceCustomCodeSettingsSection
            mailbox={mailbox}
            service={service}
            onRequestEditCustomCode={onRequestEditCustomCode} />
        </div>
      )
    }
  }

  render () {
    const { mailbox, serviceType, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(serviceType)
    return (
      <ServiceSection {...passProps} mailbox={mailbox} serviceType={serviceType}>
        {this.renderContent(mailbox, service, onRequestEditCustomCode)}
      </ServiceSection>
    )
  }
}
