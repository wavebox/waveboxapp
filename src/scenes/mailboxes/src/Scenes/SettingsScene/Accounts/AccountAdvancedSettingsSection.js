import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, MailboxReducer } from 'stores/mailbox'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import TuneIcon from '@material-ui/icons/Tune'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

export default class AccountAdvancedSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired,
    windowOpenBefore: PropTypes.node,
    windowOpenAfter: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.mailbox, nextProps.mailbox, [
        'id',
        'artificiallyPersistCookies',
        'defaultWindowOpenMode'
      ]) ||
      partialShallowCompare(
        { ...this.props, mailbox: undefined },
        this.state,
        { ...nextProps, mailbox: undefined },
        nextState
      )
    )
  }

  render () {
    const {
      mailbox,
      children,
      showRestart,
      windowOpenBefore,
      windowOpenAfter,
      ...passProps
    } = this.props

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
                  href={mailbox.artificiallyPersistCookies ? '#' : undefined}
                  disabled={!mailbox.artificiallyPersistCookies}
                  onClick={(evt) => {
                    evt.preventDefault()
                    if (mailbox.artificiallyPersistCookies) {
                      mailboxActions.clearMailboxBrowserSession(mailbox.id)
                    }
                  }}>
                  Clear all cookies manually
                </a>
              </small>
            </span>
          )}
          onChange={(evt, toggled) => {
            showRestart()
            mailboxActions.reduce(mailbox.id, MailboxReducer.setArtificiallyPersistCookies, toggled)
          }}
          checked={mailbox.artificiallyPersistCookies} />
        {windowOpenBefore}
        <SettingsListItemSelectInline
          divider={!!(windowOpenAfter || children)}
          label='Open new windows in which Browser'
          value={mailbox.defaultWindowOpenMode}
          options={[
            { value: CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER, label: 'Default Browser' },
            { value: CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX, label: 'Wavebox Browser' }
          ]}
          onChange={(evt, value) => mailboxActions.reduce(mailbox.id, MailboxReducer.setDefaultWindowOpenMode, value)} />
        {windowOpenAfter}
        {children}
      </SettingsListSection>
    )
  }
}
