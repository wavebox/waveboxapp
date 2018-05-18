import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountServiceItem from '../AccountServiceItem'
import MicrosoftDefaultService from 'shared/Models/Accounts/Microsoft/MicrosoftDefaultService'
import { mailboxActions, MicrosoftDefaultServiceReducer } from 'stores/mailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSelect from 'wbui/SettingsListSelect'

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
      <AccountServiceItem {...passProps} mailbox={mailbox} serviceType={serviceType}>
        <SettingsListSection title='Unread & Sync'>
          <SettingsListSelect
            label='Unread Mode'
            value={service.unreadMode}
            options={Array.from(service.supportedUnreadModes).map((mode) => {
              return { value: mode, label: this.humanizeUnreadMode(mode) }
            })}
            onChange={(evt, value) => {
              mailboxActions.reduceService(mailbox.id, serviceType, MicrosoftDefaultServiceReducer.setUnreadMode, value)
            }} />
        </SettingsListSection>
        <AccountBadgeSettings mailbox={mailbox} service={service} />
        <AccountNotificationSettings mailbox={mailbox} service={service} />
        <AccountBehaviourSettings mailbox={mailbox} service={service} />
        <AccountCustomCodeSettings
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode} />
      </AccountServiceItem>
    )
  }
}
