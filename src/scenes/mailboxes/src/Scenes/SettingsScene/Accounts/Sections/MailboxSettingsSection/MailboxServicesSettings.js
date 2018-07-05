import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemText from 'wbui/SettingsListItemText'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import ListIcon from '@material-ui/icons/List'
import shallowCompare from 'react-addons-shallow-compare'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'

export default class MailboxServicesSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.extractStateForMailbox(nextProps.mailboxId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForMailbox(this.props.mailboxId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.mailboxId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param mailboxId: the id of the mailbox
  * @param accountState: the account state
  */
  extractStateForMailbox (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    return mailbox ? {
      depricatedServiceUILocation: mailbox.depricatedServiceUILocation,
      collapseSidebarServices: mailbox.collapseSidebarServices
    } : {
      depricatedServiceUILocation: ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START,
      collapseSidebarServices: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, ...passProps } = this.props
    const {
      depricatedServiceUILocation,
      collapseSidebarServices
    } = this.state

    return (
      <SettingsListSection title='Services' icon={<ListIcon />} {...passProps}>
        <SettingsListItemText
          primary={(
            <span>
              Your account is split into seperate services, for example Email,
              Storage & Contacts. You can enable, disable & change
              the way these behave
            </span>
          )} />
        <SettingsListItemSelect
          label='Where should services be displayed?'
          value={depricatedServiceUILocation}
          divider={depricatedServiceUILocation === ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR}
          options={[
            { value: ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR, label: 'Left Sidebar' },
            { value: ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START, label: 'Top Toolbar (Left side)' },
            { value: ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END, label: 'Top Toolbar (Right side)' }
          ]}
          onChange={(evt, mode) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setDepricatedServiceUILocation, mode)} />
        {depricatedServiceUILocation === ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR ? (
          <SettingsListItemSwitch
            divider={false}
            label='Collapse sidebar services when account is inactive'
            onChange={(evt, toggled) => {
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setCollapseSidebarServices, toggled)
            }}
            checked={collapseSidebarServices} />
        ) : undefined}
      </SettingsListSection>
    )
  }
}
