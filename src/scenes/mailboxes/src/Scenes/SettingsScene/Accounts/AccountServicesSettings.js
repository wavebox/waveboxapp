import PropTypes from 'prop-types'
import React from 'react'
import { Paper, SelectField, MenuItem, Toggle } from 'material-ui'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

export default class AccountServicesSettings extends React.Component {
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
    settingsStore.listen(this.settingsChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    return {
      ui: settingsStore.getState().ui,
      userHasServices: userState.user.hasServices,
      userHasSleepable: userState.user.hasSleepable
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      ui: settingsState.ui
    })
  }
  userChanged = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices,
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, ...passProps } = this.props
    const { ui, userHasServices, userHasSleepable } = this.state

    if (!userHasServices && !userHasSleepable) { return false }

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Services</h1>
        <p style={styles.subheadingInfo}>
          Your account is split into seperate services, for example Email,
          Storage & Contacts. You can enable, disable & change
          the way these behave
        </p>
        {userHasServices ? (
          <div>
            <SelectField
              fullWidth
              floatingLabelText='Where should services be displayed?'
              value={mailbox.serviceDisplayMode}
              onChange={(evt, index, mode) => {
                mailboxActions.reduce(mailbox.id, MailboxReducer.setServiceDisplayMode, mode)
              }}>
              <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR} primaryText='Left Sidebar' />
              <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR} primaryText='Top Toolbar' />
            </SelectField>
            {mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR ? (
              <div>
                <Toggle
                  toggled={mailbox.collapseSidebarServices}
                  disabled={mailbox.serviceDisplayMode !== CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR}
                  label='Collapse sidebar services when account is inactive'
                  labelPosition='right'
                  onToggle={(evt, toggled) => {
                    mailboxActions.reduce(mailbox.id, MailboxReducer.setCollapseSidebarServices, toggled)
                  }} />
              </div>
            ) : undefined}
            {mailbox.serviceDisplayMode === CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR ? (
              <div>
                <SelectField
                  fullWidth
                  floatingLabelText='Icon positioning'
                  value={mailbox.serviceToolbarIconLayout}
                  onChange={(evt, index, mode) => {
                    mailboxActions.reduce(mailbox.id, MailboxReducer.setServiceToolbarIconLayout, mode)
                  }}>
                  <MenuItem value={CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.LEFT_ALIGN} primaryText='Left Align' />
                  <MenuItem value={CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.RIGHT_ALIGN} primaryText='Right Align' />
                </SelectField>
              </div>
            ) : undefined}
          </div>
        ) : undefined}
        {userHasSleepable ? (
          <Toggle
            disabled={!ui.showSleepableServiceIndicator}
            toggled={mailbox.showSleepableServiceIndicator}
            label={ui.showSleepableServiceIndicator ? (
              'Show sleeping services with greyed out icons'
            ) : (
              <span>
                <span>Show sleeping services with greyed out icons</span>
                <br />
                <small>Enable "Show sleeping services with greyed out icons" in the main UI settings first</small>
              </span>
            )}
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setShowSleepableServiceIndicator, toggled)
            }} />
        ) : undefined}
      </Paper>
    )
  }
}
