import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceSection from '../ServiceSection'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'
import GoogleCustomUnreadSettings from './GoogleCustomUnreadSettings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'

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

  /**
  * Turns an unread mode into a friendlier string
  * @param mode: the unread mode
  * @return the humanized version
  */
  humanizeUnreadMode (mode) {
    switch (mode) {
      case GoogleDefaultService.UNREAD_MODES.INBOX_ALL:
        return 'All Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return 'Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return 'Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_ATOM:
        return '(Experimental) Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM:
        return '(Experimental) Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM:
        return '(Experimental) Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED:
        return 'Unread Unbundled Messages'
    }
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
        <SettingsListSection title='Unread & Sync'>
          <SettingsListItemSelect
            label='Unread Mode'
            value={service.unreadMode}
            options={Array.from(service.supportedUnreadModes).map((mode) => {
              return { value: mode, label: this.humanizeUnreadMode(mode) }
            })}
            onChange={(evt, value) => {
              mailboxActions.reduceService(mailbox.id, serviceType, GoogleDefaultServiceReducer.setUnreadMode, value)
            }} />
          <GoogleCustomUnreadSettings mailbox={mailbox} service={service} />
        </SettingsListSection>
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
