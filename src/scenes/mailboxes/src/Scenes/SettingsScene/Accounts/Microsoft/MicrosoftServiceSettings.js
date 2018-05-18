import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountServiceItem from '../AccountServiceItem'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'

export default class MicrosoftServiceSettings extends React.Component {
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

    if (AccountBadgeSettings.willRenderForService(service) || AccountNotificationSettings.willRenderForService(service)) {
      return (
        <div>
          <AccountBadgeSettings mailbox={mailbox} service={service} />
          <AccountNotificationSettings mailbox={mailbox} service={service} />
          <AccountBehaviourSettings mailbox={mailbox} service={service} />
          <AccountCustomCodeSettings
            mailbox={mailbox}
            service={service}
            onRequestEditCustomCode={onRequestEditCustomCode} />
        </div>
      )
    } else {
      return (
        <div>
          <AccountBehaviourSettings mailbox={mailbox} service={service} />
          <AccountCustomCodeSettings
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
      <AccountServiceItem {...passProps} mailbox={mailbox} serviceType={serviceType}>
        {this.renderContent(mailbox, service, onRequestEditCustomCode)}
      </AccountServiceItem>
    )
  }
}
