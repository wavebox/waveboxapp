import PropTypes from 'prop-types'
import React from 'react'
import { accountActions, accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import { withStyles } from '@material-ui/core/styles'
import SmsIcon from '@material-ui/icons/Sms'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import ColorLensIcon from '@material-ui/icons/ColorLens'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import AccountAvatarProcessor from 'shared/AltStores/Account/AccountAvatarProcessor'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import SettingsListItemColorPicker from 'wbui/SettingsListItemColorPicker'
import SettingsListItemAvatarPicker from 'wbui/SettingsListItemAvatarPicker'
import SettingsListItemSection from 'wbui/SettingsListItemSection'

const styles = {

}

@withStyles(styles)
class MailboxAppearanceSettings extends React.Component {
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
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
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
    const userState = userStore.getState()
    return {
      uiShowSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator,
      userHasSleepable: userState.user.hasSleepable,
      ...this.extractStateForMailbox(this.props.mailboxId, accountStore.getState())
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      uiShowSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

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
    return {
      resolvedMailboxFullName: [
        accountState.resolvedMailboxBaseDisplayName(mailboxId),
        accountState.resolvedMailboxExtendedDisplayName(mailboxId)
      ].join(' : '), // Avoid the normal resolved as this will take note of mailbox.showExtendedDispayName
      ...(mailbox ? {
        mailboxColor: mailbox.color,
        mailboxShowAvatarColorRing: mailbox.showAvatarColorRing,
        mailboxShowSleepableServiceIndicator: mailbox.showSleepableServiceIndicator,
        mailboxShowBadge: mailbox.showBadge,
        mailboxBadgeColor: mailbox.badgeColor,
        mailboxDisplayName: mailbox.displayName, // Raw value, don't resolve
        navigationBarUiLocation: mailbox.navigationBarUiLocation,
        mailboxAvatar: accountState.getAvatar(mailbox.avatarId),
        mailboxCollapseSidebarServices: mailbox.collapseSidebarServices,
        mailboxSidebarFirstServicPriority: mailbox.sidebarFirstServicePriority,
        mailboxServiceUiPriority: mailbox.serviceUiPriority,
        mailboxShowExtendedDispayName: mailbox.showExtendedDispayName
      } : {
        mailboxColor: '#FFF',
        mailboxShowAvatarColorRing: true,
        mailboxShowSleepableServiceIndicator: true,
        mailboxShowBadge: true,
        mailboxBadgeColor: '#FFF',
        navigationBarUiLocation: ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.AUTO,
        mailboxAvatar: undefined,
        mailboxCollapseSidebarServices: false,
        mailboxSidebarFirstServicPriority: ACMailbox.SIDEBAR_FIRST_SERVICE_PRIORITY.NORMAL,
        mailboxServiceUiPriority: ACMailbox.SERVICE_UI_PRIORITY.TOOLBAR,
        mailboxShowExtendedDispayName: true
      })
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, classes, ...passProps } = this.props
    const {
      userHasSleepable,
      uiShowSleepableServiceIndicator,
      mailboxColor,
      mailboxShowAvatarColorRing,
      mailboxShowSleepableServiceIndicator,
      mailboxShowBadge,
      mailboxBadgeColor,
      mailboxDisplayName,
      navigationBarUiLocation,
      mailboxAvatar,
      mailboxCollapseSidebarServices,
      mailboxSidebarFirstServicPriority,
      mailboxServiceUiPriority,
      mailboxShowExtendedDispayName,
      resolvedMailboxFullName
    } = this.state

    return (
      <div {...passProps}>
        <SettingsListSection title='Appearance' icon={<ViewQuiltIcon />}>
          <SettingsListItemSection>
            <SettingsListItemTextField
              key={`displayName_${mailboxDisplayName}`}
              divider={false}
              label='Display Name'
              textFieldProps={{
                defaultValue: mailboxDisplayName,
                placeholder: 'My Account',
                onBlur: (evt) => {
                  accountActions.reduceMailbox(mailboxId, MailboxReducer.setDisplayName, evt.target.value)
                }
              }} />
            <SettingsListItemSwitch
              divider={false}
              label='Show extended info alongside the name'
              secondary={`For example: ${resolvedMailboxFullName}`}
              onChange={(evt, toggled) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowExtendedDispayName, toggled)}
              checked={mailboxShowExtendedDispayName} />
          </SettingsListItemSection>
          <SettingsListItemColorPicker
            labelText='Account Color'
            IconClass={ColorLensIcon}
            value={mailboxColor}
            onChange={(col) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setColor, col)}
            showClear
            ClearIconClass={NotInterestedIcon}
            clearLabelText='Clear color'
          />
          <SettingsListItemColorPicker
            labelText='Badge Color'
            IconClass={SmsIcon}
            value={mailboxBadgeColor}
            onChange={(col) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setBadgeColor, col)}
            showClear={false}
          />
          <SettingsListItemAvatarPicker
            label='Change Account Icon'
            icon={<InsertEmoticonIcon />}
            preview={mailboxAvatar}
            onChange={(evt) => {
              AccountAvatarProcessor.processAvatarFileUpload(evt, (av) => {
                accountActions.setCustomAvatarOnMailbox(mailboxId, av)
              })
            }}
            onClear={() => accountActions.setCustomAvatarOnMailbox(mailboxId, undefined)}
            clearLabel='Reset Account Icon'
            clearIcon={<NotInterestedIcon />} />
          <SettingsListItemSwitch
            divider={userHasSleepable}
            label='Show Account Color around Icon'
            onChange={(evt, toggled) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowAvatarColorRing, toggled)}
            checked={mailboxShowAvatarColorRing} />
          {userHasSleepable ? (
            <SettingsListItemSwitch
              disabled={!uiShowSleepableServiceIndicator}
              label={(
                <span>
                  <span>Show sleeping service icons in grey</span>
                  {!uiShowSleepableServiceIndicator ? <br /> : undefined}
                  {!uiShowSleepableServiceIndicator ? (
                    <small>Enable "Show sleeping account icons in grey" in the main UI settings first</small>
                  ) : undefined}
                </span>
              )}
              onChange={(evt, toggled) => {
                accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowSleepableServiceIndicator, toggled)
              }}
              checked={mailboxShowSleepableServiceIndicator} />
          ) : undefined}
          <SettingsListItemSwitch
            label='Show total unread count from all services'
            onChange={(evt, toggled) => {
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setShowBadge, toggled)
            }}
            checked={mailboxShowBadge} />
          <SettingsListItemSelect
            label='Where should the navigation bar be displayed?'
            value={navigationBarUiLocation}
            options={[
              { value: ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.AUTO, label: 'Auto' },
              { value: ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.PRIMARY_TOOLBAR, label: 'With Services & Extensions' },
              { value: ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.SECONDARY_TOOLBAR, label: 'In a Standalone toolbar' }
            ]}
            onChange={(evt, mode) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setNavigationBarUiLocation, mode)} />
          <SettingsListItemSwitch
            label='Collapse sidebar services when account is inactive'
            onChange={(evt, toggled) => {
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setCollapseSidebarServices, toggled)
            }}
            checked={mailboxCollapseSidebarServices} />
          <SettingsListItemSelect
            label='First sidebar service prioritization (Experimental)'
            value={mailboxSidebarFirstServicPriority}
            options={[
              {
                value: ACMailbox.SIDEBAR_FIRST_SERVICE_PRIORITY.NORMAL,
                label: 'Normal',
                primaryText: 'Normal - show in the sidebar with other services'
              },
              {
                value: ACMailbox.SIDEBAR_FIRST_SERVICE_PRIORITY.COLLAPSED,
                label: 'Collapsed',
                primaryText: 'Collapsed - hide from the sidebar'
              },
              {
                value: ACMailbox.SIDEBAR_FIRST_SERVICE_PRIORITY.PRIMARY,
                label: 'Primary',
                primaryText: 'Primary - take the place of the account in the sidebar'
              }
            ]}
            onChange={(evt, mode) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setSidebarFirstServicePriority, mode)} />
          <SettingsListItemSelect
            divider={false}
            label='Service layout priority'
            value={mailboxServiceUiPriority}
            options={[
              { value: ACMailbox.SERVICE_UI_PRIORITY.AUTO, label: 'Auto' },
              { value: ACMailbox.SERVICE_UI_PRIORITY.TOOLBAR, label: 'Toolbar first' },
              { value: ACMailbox.SERVICE_UI_PRIORITY.SIDEBAR, label: 'Sidebar first' }
            ]}
            onChange={(evt, mode) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setServiceUiPriority, mode)} />
        </SettingsListSection>
      </div>
    )
  }
}

export default MailboxAppearanceSettings
