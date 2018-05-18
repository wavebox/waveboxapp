import React from 'react'
import PropTypes from 'prop-types'
import { mailboxActions, MicrosoftDefaultServiceReducer } from 'stores/mailbox'
import { Paper } from 'material-ui'
import WizardConfigureUnreadModeOption from './WizardConfigureUnreadModeOption'
import MicrosoftDefaultService from 'shared/Models/Accounts/Microsoft/MicrosoftDefaultService'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import { withStyles } from 'material-ui/styles'
import yellow from 'material-ui/colors/yellow'
import lightBlue from 'material-ui/colors/lightBlue'

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
  popoverTitleTabContainer: {
    padding: 16
  },
  popoverTitleTabItem: {
    display: 'inline-block',
    fontSize: 21,
    fontWeight: 300,
    color: '#333',
    marginLeft: 13,
    marginRight: 13,
    paddingBottom: 4
  },
  popoverTitleTabItemActive: {
    color: '#0078D7',
    borderBottom: '1px solid #0078D7'
  },
  popoverTitleTabItemInactive: {
    color: '#666'
  }
}

@withStyles(styles)
class WizardConfigureMicrosoft extends React.Component {
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
    mailboxActions.reduceService(mailbox.id, MicrosoftDefaultService.type, MicrosoftDefaultServiceReducer.setUnreadMode, unreadMode)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailbox, onRequestCancel, classes, ...passProps } = this.props
    const unreadMode = mailbox.defaultService.unreadMode

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailbox.id}
        {...passProps}>
        <h2 className={classes.heading}>Choose your Inbox mode</h2>
        <p className={classes.subHeading}>
          Your Microsoft account uses one of the following modes to organise your inbox.
          Select the one that matches your existing settings. Don't worry if you don't know
          what it is you can change it later!
        </p>
        <div className={classes.unreadOptions}>
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={yellow[700]}
            selected={unreadMode === MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD}
            onSelected={() => this.handleModePicked(MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD)}
            name='Unread Inbox'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Unread Inbox</h3>
                <Paper className={classes.popoverTitleTabContainer}>
                  <div className={classes.popoverTitleTabItem}>Inbox</div>
                </Paper>
                <p>
                  Your new emails are sent directly to your Inbox. Typically the title you see above
                  your emails is <em>Inbox</em>.
                </p>
              </div>
            )} />
          <WizardConfigureUnreadModeOption
            className={classes.unreadOption}
            color={lightBlue[700]}
            selected={unreadMode === MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD}
            onSelected={() => this.handleModePicked(MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD)}
            name='Focused Inbox'
            popoverContent={(
              <div className={classes.popoverContainer}>
                <h3>Focused Inbox</h3>
                <Paper className={classes.popoverTitleTabContainer}>
                  <div style={{...styles.popoverTitleTabItem, ...styles.popoverTitleTabItemActive}}>Focused</div>
                  <div style={{...styles.popoverTitleTabItem, ...styles.popoverTitleTabItemInactive}}>Other</div>
                </Paper>
                <p>
                  Your new emails are sorted into Focused and Other Tabs. Typically the title you
                  will see above your emails is a choice between <em>Focused</em> and <em>Other</em>.
                </p>
              </div>
            )} />
        </div>
        <p className={classes.extraSubHeading}>Hover over each choice for more information</p>
      </WizardConfigureDefaultLayout>
    )
  }
}

export default WizardConfigureMicrosoft
