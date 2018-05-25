import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemText from 'wbui/SettingsListItemText'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import ListIcon from '@material-ui/icons/List'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

export default class AccountServicesSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      userHasServices: userState.user.hasServices
    }
  })()

  userChanged = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.mailbox, nextProps.mailbox, [
        'id',
        'serviceDisplayMode',
        'collapseSidebarServices',
        'serviceToolbarIconLayout'
      ]) ||
      partialShallowCompare({}, this.state, {}, nextState)
    )
  }

  render () {
    const { mailbox, ...passProps } = this.props
    const { userHasServices } = this.state

    if (!userHasServices) { return false }

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
          value={mailbox.serviceDisplayMode}
          options={[
            { value: CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR, label: 'Left Sidebar' },
            { value: CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR, label: 'Top Toolbar' }
          ]}
          onChange={(evt, mode) => mailboxActions.reduce(mailbox.id, MailboxReducer.setServiceDisplayMode, mode)} />
        {mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR ? (
          <SettingsListItemSwitch
            divider={false}
            label='Collapse sidebar services when account is inactive'
            onChange={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setCollapseSidebarServices, toggled)
            }}
            checked={mailbox.collapseSidebarServices} />
        ) : undefined}
        {mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR ? (
          <SettingsListItemSelect
            divider={false}
            label='Icon positioning'
            value={mailbox.serviceToolbarIconLayout}
            options={[
              { value: CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.LEFT_ALIGN, label: 'Left Align' },
              { value: CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.RIGHT_ALIGN, label: 'Right Align' }
            ]}
            onChange={(evt, mode) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setServiceToolbarIconLayout, mode)
            }} />
        ) : undefined}
      </SettingsListSection>
    )
  }
}
