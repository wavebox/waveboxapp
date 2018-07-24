import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import MicrosoftMailService from 'shared/Models/ACAccounts/Microsoft/MicrosoftMailService'
import MicrosoftMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/MicrosoftMailServiceReducer'
import ServiceAdvancedSection from '../Common/ServiceAdvancedSection'

export default class MicrosoftMailServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState({
        ...this.extractStateForService(nextProps.serviceId, accountStore.getState())
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      unreadMode: service.unreadMode
    } : {
      hasService: false
    }
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
      case MicrosoftMailService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case MicrosoftMailService.UNREAD_MODES.INBOX_FOCUSED_UNREAD:
        return 'Unread Focused Messages'
    }
  }

  render () {
    const { serviceId, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const {
      hasService,
      unreadMode
    } = this.state
    if (!hasService) { return false }

    return (
      <div {...passProps}>
        <SettingsListSection title='Unread & Sync'>
          <SettingsListItemSelect
            divider={false}
            label='Unread Mode'
            value={unreadMode}
            options={Object.keys(MicrosoftMailService.UNREAD_MODES).map((mode) => {
              return { value: mode, label: this.humanizeUnreadMode(mode) }
            })}
            onChange={(evt, value) => {
              accountActions.reduceService(serviceId, MicrosoftMailServiceReducer.setUnreadMode, value)
            }} />
        </SettingsListSection>
        <ServiceAppearanceSection serviceId={serviceId} />
        <ServiceBadgeSection serviceId={serviceId} />
        <ServiceBehaviourSection serviceId={serviceId} />
        <ServiceNotificationSection serviceId={serviceId} />
        <ServiceAdvancedSection serviceId={serviceId} onRequestEditCustomCode={onRequestEditCustomCode} />
      </div>
    )
  }
}
