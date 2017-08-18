import React from 'react'
import PropTypes from 'prop-types'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import WizardConfigureUnreadModeOption from './WizardConfigureUnreadModeOption'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import * as Colors from 'material-ui/styles/colors'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'

const styles = {
  // Typography
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  },
  extraSubHeading: {
    fontWeight: 300,
    fontSize: 14
  },

  // Unread
  unreadOptions: {
    marginTop: 40,
    marginBottom: 40
  },
  unreadOption: {
    display: 'inline-block',
    verticalAlign: 'top'
  },

  // Popover
  popoverContainer: {
    maxWidth: 320
  },
  popoverPreviewImage: {
    maxWidth: '100%',
    margin: '0px auto',
    display: 'block'
  }
}

export default class WizardConfigureGinbox extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a mode being picked by updating the mailbox
  * @param unreadMode: the picked unread mode
  */
  handleModePicked = (unreadMode) => {
    const { mailbox } = this.props
    mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setUnreadMode, unreadMode)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      mailbox,
      onRequestCancel,
      ...passProps
    } = this.props
    const unreadMode = mailbox.defaultService.unreadMode

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailbox.id}
        {...passProps}>
        <h2 style={styles.heading}>Pick which unread mode to use</h2>
        <p style={styles.subHeading}>
          Google Inbox organizes your emails into bundles. You can configure
          Wavebox to notify you about these or emails when they arrive depending
          on how you use Google Inbox.
        </p>
        <div style={styles.unreadOptions}>
          <WizardConfigureUnreadModeOption
            style={styles.unreadOption}
            color={Colors.yellow700}
            selected={unreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED}
            onSelected={() => this.handleModePicked(GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED)}
            name='Unread Unbundled Messages'
            popoverContent={(
              <div style={styles.popoverContainer}>
                <h3>Unread Unbundled Messages</h3>
                <img style={styles.popoverPreviewImage} src='../../images/ginbox_mode_unreadunbundled_small.png' />
                <p>
                  Some new emails are automatically placed in bundles such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. You'll only be notified about emails
                  that aren't placed in bundles such as these. This is default behaviour also seen
                  in the iOS and Android Inbox Apps.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            style={styles.unreadOption}
            color={Colors.lightBlue700}
            selected={unreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD}
            onSelected={() => this.handleModePicked(GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD)}
            name='Unread Inbox'
            popoverContent={(
              <div style={styles.popoverContainer}>
                <h3>Unread Inbox</h3>
                <img style={styles.popoverPreviewImage} src='../../images/ginbox_mode_inbox_small.png' />
                <p>
                  Some new emails are automatically placed in bundles such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. You'll be notified about the total amount
                  of unread emails in your account, whether they are in a bundle or not.
                </p>
              </div>
            )} />
        </div>
        <p style={styles.extraSubHeading}>Hover over each choice for more information</p>
      </WizardConfigureDefaultLayout>
    )
  }
}
