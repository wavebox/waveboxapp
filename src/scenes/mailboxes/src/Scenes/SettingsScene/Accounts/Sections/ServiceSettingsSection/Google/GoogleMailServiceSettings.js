import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceCustomCodeSection from '../Common/ServiceCustomCodeSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import GoogleMailUnreadSettings from './GoogleMailUnreadSettings'

export default class GoogleMailServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceId, showRestart, onRequestEditCustomCode, ...passProps } = this.props
//TODO googledrive links
    return (
      <div {...passProps}>
        <GoogleMailUnreadSettings serviceId={serviceId} />
        <ServiceAppearanceSection serviceId={serviceId} />
        <ServiceBadgeSection serviceId={serviceId} />
        <ServiceBehaviourSection serviceId={serviceId} />
        <ServiceNotificationSection serviceId={serviceId} />
        <ServiceCustomCodeSection serviceId={serviceId} onRequestEditCustomCode={onRequestEditCustomCode} />
      </div>
    )
  }
}
