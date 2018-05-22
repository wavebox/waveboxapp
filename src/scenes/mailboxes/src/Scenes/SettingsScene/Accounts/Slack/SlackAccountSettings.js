import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountAppearanceSettingsSection from '../AccountAppearanceSettingsSection'
import AccountAdvancedSettingsSection from '../AccountAdvancedSettingsSection'
import AccountDestructiveSettingsSection from '../AccountDestructiveSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import AccountSettingsScroller from '../AccountSettingsScroller'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import AdjustIcon from '@material-ui/icons/Adjust'
import NotificationsIcon from '@material-ui/icons/Notifications'
import HotelIcon from '@material-ui/icons/Hotel'
import CodeIcon from '@material-ui/icons/Code'
import BuildIcon from '@material-ui/icons/Build'
import TuneIcon from '@material-ui/icons/Tune'

export default class SlackAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
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
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)

    return (
      <AccountSettingsScroller
        scrollspyItems={[
          { id: `sec-${mailbox.id}-${service.type}-appearance`, name: 'Appearance', IconClass: ViewQuiltIcon },
          { id: `sec-${mailbox.id}-${service.type}-badge`, name: 'Badge', IconClass: AdjustIcon },
          { id: `sec-${mailbox.id}-${service.type}-notifications`, name: 'Notifications', IconClass: NotificationsIcon },
          { id: `sec-${mailbox.id}-${service.type}-behaviour`, name: 'Behaviour & Sleep', IconClass: HotelIcon },
          { id: `sec-${mailbox.id}-${service.type}-code`, name: 'Code & Userscripts', IconClass: CodeIcon },
          { id: `sec-${mailbox.id}-${service.type}-advanced`, name: 'Advanced', IconClass: TuneIcon },
          { id: `sec-${mailbox.id}-${service.type}-destructive`, name: 'Tools', IconClass: BuildIcon }
        ]}
        {...passProps}>
        <AccountAppearanceSettingsSection
          id={`sec-${mailbox.id}-${service.type}-appearance`}
          mailbox={mailbox} />
        <ServiceBadgeSettingsSection
          id={`sec-${mailbox.id}-${service.type}-badge`}
          mailbox={mailbox}
          service={service} />
        <ServiceNotificationSettingsSection
          id={`sec-${mailbox.id}-${service.type}-notifications`}
          mailbox={mailbox}
          service={service} />
        <ServiceBehaviourSettingsSection
          id={`sec-${mailbox.id}-${service.type}-behaviour`}
          mailbox={mailbox}
          service={service} />
        <ServiceCustomCodeSettingsSection
          id={`sec-${mailbox.id}-${service.type}-code`}
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode} />
        <AccountAdvancedSettingsSection
          id={`sec-${mailbox.id}-${service.type}-advanced`}
          mailbox={mailbox}
          showRestart={showRestart} />
        <AccountDestructiveSettingsSection
          id={`sec-${mailbox.id}-${service.type}-destructive`}
          mailbox={mailbox} />
      </AccountSettingsScroller>
    )
  }
}
