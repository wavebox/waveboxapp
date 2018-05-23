import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceSection from '../ServiceSection'
import MicrosoftDefaultService from 'shared/Models/Accounts/Microsoft/MicrosoftDefaultService'
import { mailboxActions, MicrosoftDefaultServiceReducer } from 'stores/mailbox'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'

export default class MicrosoftDefaultServiceSettings extends React.Component {
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
      case MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD:
        return 'Unread Focused Messages'
    }
  }

  render () {
    const { mailbox, onRequestEditCustomCode, ...passProps } = this.props
    const serviceType = MicrosoftDefaultService.SERVICE_TYPES.DEFAULT
    const service = mailbox.serviceForType(serviceType)

    return (
      <ServiceSection {...passProps} mailbox={mailbox} serviceType={serviceType}>
        <SettingsListSection title='Unread & Sync'>
          <SettingsListItemSelect
            divider={false}
            label='Unread Mode'
            value={service.unreadMode}
            options={Object.keys(MicrosoftDefaultService.UNREAD_MODES).map((mode) => {
              return { value: mode, label: this.humanizeUnreadMode(mode) }
            })}
            onChange={(evt, value) => {
              mailboxActions.reduceService(mailbox.id, serviceType, MicrosoftDefaultServiceReducer.setUnreadMode, value)
            }} />
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
