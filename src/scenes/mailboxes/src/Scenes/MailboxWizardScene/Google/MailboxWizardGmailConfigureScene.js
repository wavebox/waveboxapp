import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, Paper, Dialog, RadioButtonGroup, RadioButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import { Row, Col } from 'Components/Grid'

const styles = {
  radioButton: {
    marginBottom: 8,
    marginTop: 8
  },
  title: {
    fontWeight: 'normal',
    color: 'rgb(33, 33, 33)'
  },
  modeTitle: {
    fontWeight: 'normal'
  },
  previewImage: {
    maxWidth: '100%'
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
    return {
      open: true,
      unreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL,
      hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user picking a configuration
  */
  handleNext = () => {
    const id = this.props.match.params.mailboxId
    mailboxActions.reduceService(id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setUnreadMode, this.state.unreadMode)

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
    const { open, unreadMode, hoveredUnreadMode } = this.state

    const actions = (
      <div>
        <RaisedButton label='Next' primary onClick={this.handleNext} />
      </div>
    )

    return (
      <Dialog
        open={open}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        actions={actions}
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        autoScrollBodyContent>
        <Row>
          <Col xs={6}>
            <h3 style={styles.title}>Pick which unread mode to use</h3>
            <p>
              Gmail supports multiple Inbox types, pick the one below
              that matches the type you currently use to configure Wavebox
              to show the correct Notifications and Unread Badges
            </p>
            <p>
              <small>This setting can be changed later in your account settings</small>
            </p>
            <RadioButtonGroup
              name='unreadMode'
              onChange={(evt, value) => this.setState({ unreadMode: value })}
              defaultSelected={unreadMode}>
              <RadioButton
                style={styles.radioButton}
                value={GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL })}
                label='Categories Inbox' />
              <RadioButton
                style={styles.radioButton}
                value={GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD })}
                label='Unread Inbox' />
              <RadioButton
                style={styles.radioButton}
                value={GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT })}
                label='Priority Inbox' />
            </RadioButtonGroup>
            <p>
              <small>Hover over each option for more information</small>
            </p>
          </Col>
          <Col xs={6}>
            {hoveredUnreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL ? (
              <div>
                <h3 style={styles.modeTitle}>Categories Inbox</h3>
                <Paper>
                  <img style={styles.previewImage} src='../../images/gmail_inbox_categories_small.png' />
                </Paper>
                <p>
                  Your new emails are automatically sorted into Categories such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. Typically you will see a number of
                  category tabs above your emails
                </p>
              </div>
            ) : undefined}
            {hoveredUnreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD ? (
              <div>
                <h3 style={styles.modeTitle}>Unread Inbox</h3>
                <Paper>
                  <img style={styles.previewImage} src='../../images/gmail_inbox_unread_small.png' />
                </Paper>
                <p>
                  Your new emails are sent directly to your Inbox and are not automatically sorted
                  into categories or ranked by priority. Typically the title you see above
                  your emails is <em>Unread</em>.
                </p>
              </div>
            ) : undefined}
            {hoveredUnreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT ? (
              <div>
                <h3 style={styles.modeTitle}>Priority Inbox</h3>
                <Paper>
                  <img style={styles.previewImage} src='../../images/gmail_inbox_priority_small.png' />
                </Paper>
                <p>
                  Your new emails are either marked as important or not and the important
                  emails are split into their own section when they arrive. Typically the title you see above
                  your emails is <em>Important and unread</em>.
                </p>
              </div>
            ) : undefined}
          </Col>
        </Row>
      </Dialog>
    )
  }
}
