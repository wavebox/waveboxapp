import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, Paper, Dialog } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'

const styles = {
  introduction: {
    textAlign: 'center',
    padding: 12,
    fontSize: '110%',
    fontWeight: 'bold'
  },
  configurations: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  configuration: {
    padding: 8,
    margin: 8,
    textAlign: 'center',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    flexBasis: '50%',
    justifyContent: 'space-between',
    cursor: 'pointer'
  },
  configurationButton: {
    display: 'block',
    margin: 12
  },
  configurationImage: {
    height: 80,
    marginTop: 8,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  configurationTechInfo: {
    color: Colors.grey500,
    fontSize: '85%'
  }
}

export default class MailboxWizardGmailConfigureScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxId: PropTypes.string.isRequired
      })
    })
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return { open: true }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user picking a configuration
  * @param unreadMode: the unread mode to set for the user
  */
  handleConfigurationPicked = (unreadMode) => {
    const id = this.props.match.params.mailboxId
    mailboxActions.reduceService(id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setUnreadMode, unreadMode)

    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/mailbox_wizard/google/services/' + id
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open } = this.state

    return (
      <Dialog
        open={open}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        autoScrollBodyContent>
        <div style={styles.introduction}>
          Pick the type of inbox that you use in Gmail to configure Wavebox
          notifications and unread counters
        </div>
        <div style={styles.configurations}>
          <Paper
            style={styles.configuration}
            onClick={() => this.handleConfigurationPicked(GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL)}>
            <div>
              <RaisedButton primary label='Categories Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/gmail_inbox_categories_small.png")`
              }, styles.configurationImage)} />
              <p>
                I'm only interested in unread messages in the primary category
              </p>
              <p style={styles.configurationTechInfo}>
                Unread Messages in Primary Category
              </p>
            </div>
          </Paper>
          <Paper
            style={styles.configuration}
            onClick={() => this.handleConfigurationPicked(GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD)}>
            <div>
              <RaisedButton primary label='Unread Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/gmail_inbox_unread_small.png")`
              }, styles.configurationImage)} />
              <p>
                I'm interested in all unread messages in my inbox
              </p>
              <p style={styles.configurationTechInfo}>
                All Unread Messages
              </p>
            </div>
          </Paper>
          <Paper
            style={styles.configuration}
            onClick={() => this.handleConfigurationPicked(GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT)}>
            <div>
              <RaisedButton primary label='Priority Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/gmail_inbox_priority_small.png")`
              }, styles.configurationImage)} />
              <p>
                I'm only interested in unread messages if they are marked as important
              </p>
              <p style={styles.configurationTechInfo}>
                Unread Important Messages
              </p>
            </div>
          </Paper>
        </div>
      </Dialog>
    )
  }
}
