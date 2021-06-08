import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import GoogleMailUnreadSettings from './GoogleMailUnreadSettings'
import ServiceAdvancedSection from '../Common/ServiceAdvancedSection'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import BugReportIcon from '@material-ui/icons/BugReport'
import { WB_IENGINE_LOG_NETWORK_EVENTS_ } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

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
    const {
      serviceId,
      showRestart,
      onRequestEditCustomCode,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <GoogleMailUnreadSettings serviceId={serviceId} />
        <ServiceAppearanceSection serviceId={serviceId} />
        <ServiceBadgeSection serviceId={serviceId} />
        <ServiceBehaviourSection serviceId={serviceId} />
        <ServiceNotificationSection serviceId={serviceId} />
        <ServiceAdvancedSection
          serviceId={serviceId}
          onRequestEditCustomCode={onRequestEditCustomCode}>
          <SettingsListItemButton
            divider={false}
            label='Log Sync network requests'
            icon={<BugReportIcon />}
            onClick={() => ipcRenderer.send(`${WB_IENGINE_LOG_NETWORK_EVENTS_}${serviceId}`)} />
        </ServiceAdvancedSection>
      </div>
    )
  }
}
