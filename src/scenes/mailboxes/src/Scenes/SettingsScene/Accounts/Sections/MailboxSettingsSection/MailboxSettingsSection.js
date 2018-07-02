import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import MailboxAppearanceSettings from './MailboxAppearanceSettings'
import MailboxServicesSettings from './MailboxServicesSettings'
import MailboxAdvancedSettings from './MailboxAdvancedSettings'
import MailboxToolsSettings from './MailboxToolsSettings'

const styles = {

}

@withStyles(styles)
class MailboxSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      mailboxId,
      showRestart,
      onRequestEditCustomCode,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <MailboxAppearanceSettings
          id={`mailbox-appearance-${mailboxId}`}
          mailboxId={mailboxId} />
        <MailboxServicesSettings
          id={`mailbox-services-${mailboxId}`}
          mailboxId={mailboxId} />
        <MailboxAdvancedSettings
          id={`mailbox-advanced-${mailboxId}`}
          showRestart={showRestart}
          mailboxId={mailboxId} />
        <MailboxToolsSettings
          id={`mailbox-tools-${mailboxId}`}
          mailboxId={mailboxId} />
      </div>
    )
  }
}

export default MailboxSettingsSection
