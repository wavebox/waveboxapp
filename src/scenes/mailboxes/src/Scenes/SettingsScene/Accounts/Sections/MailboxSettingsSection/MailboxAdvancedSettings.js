import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import TuneIcon from '@material-ui/icons/Tune'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import SettingsListItemSection from 'wbui/SettingsListItemSection'

export default class MailboxAdvancedSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired
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
      artificiallyPersistCookies: mailbox.artificiallyPersistCookies,
      defaultWindowOpenMode: mailbox.defaultWindowOpenMode,
      useCustomUserAgent: mailbox.useCustomUserAgent,
      customUserAgentString: mailbox.customUserAgentString,
      openDriveLinksWithExternalBrowser: mailbox.openDriveLinksWithExternalBrowser
    } : {
      artificiallyPersistCookies: false,
      defaultWindowOpenMode: ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER,
      useCustomUserAgent: false,
      customUserAgentString: '',
      openDriveLinksWithExternalBrowser: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      showRestart,
      ...passProps
    } = this.props
    const {
      artificiallyPersistCookies,
      defaultWindowOpenMode,
      useCustomUserAgent,
      customUserAgentString,
      openDriveLinksWithExternalBrowser
    } = this.state

    return (
      <SettingsListSection title='Advanced' icon={<TuneIcon />} {...passProps}>
        <SettingsListItemSwitch
          label='Artificially Persist Cookies. (Requires Restart)'
          secondary={(
            <span>
              <small>
                <span>
                  Not recommended for most users but helpful if you are signed out every restart. If you enable
                  this, you may need be logged out and need to&nbsp;
                </span>
                <a
                  href={artificiallyPersistCookies ? '#' : undefined}
                  disabled={!artificiallyPersistCookies}
                  onClick={(evt) => {
                    evt.preventDefault()
                    if (artificiallyPersistCookies) {
                      accountActions.clearMailboxBrowserSession(mailboxId)
                    }
                  }}>
                  Clear all cookies manually
                </a>
              </small>
            </span>
          )}
          onChange={(evt, toggled) => {
            showRestart()
            accountActions.reduceMailbox(mailboxId, MailboxReducer.setArtificiallyPersistCookies, toggled)
          }}
          checked={artificiallyPersistCookies} />
        <SettingsListItemSelectInline
          label='Open new windows in which Browser'
          value={defaultWindowOpenMode}
          options={[
            { value: ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER, label: 'Default Browser' },
            { value: ACMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX, label: 'Wavebox Browser' }
          ]}
          onChange={(evt, value) => accountActions.reduceMailbox(mailboxId, MailboxReducer.setDefaultWindowOpenMode, value)} />
        <SettingsListItemSwitch
          label='Always open Google Drive links in the default browser'
          checked={openDriveLinksWithExternalBrowser}
          onChange={(evt, toggled) => {
            accountActions.reduceMailbox(mailboxId, MailboxReducer.setOpenDriveLinksWithExternalBrowser, toggled)
          }} />
        <SettingsListItemSection divider={false}>
          <SettingsListItemSwitch
            divider={false}
            label='Use custom UserAgent (Requires restart)'
            onChange={(evt, toggled) => {
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setUseCustomUserAgent, toggled)
              showRestart()
            }}
            checked={useCustomUserAgent} />
          <SettingsListItemTextField
            divider={false}
            key={`userAgent_${customUserAgentString}`}
            disabled={!useCustomUserAgent}
            label='Custom UserAgent String (Requires restart)'
            textFieldProps={{
              defaultValue: customUserAgentString,
              onBlur: (evt) => {
                accountActions.reduceMailbox(mailboxId, MailboxReducer.setCustomUserAgentString, evt.target.value)
                showRestart()
              }
            }} />
          <SettingsListItemButton
            divider={false}
            label='Restore UserAgent defaults (Requires restart)'
            onClick={() => {
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setUseCustomUserAgent, false)
              accountActions.reduceMailbox(mailboxId, MailboxReducer.setCustomUserAgentString, '')
              showRestart()
            }} />
        </SettingsListItemSection>
      </SettingsListSection>
    )
  }
}
