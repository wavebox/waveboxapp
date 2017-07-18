import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, Paper, Dialog, RadioButton, RadioButtonGroup } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import MicrosoftDefaultService from 'shared/Models/Accounts/Microsoft/MicrosoftDefaultService'
import { mailboxActions, MicrosoftDefaultServiceReducer } from 'stores/mailbox'
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
  titleTabContainer: {
    padding: 16
  },
  titleTabItem: {
    display: 'inline-block',
    fontSize: 21,
    fontWeight: '100',
    color: '#333',
    marginLeft: 13,
    marginRight: 13,
    paddingBottom: 4
  },
  titleTabItemActive: {
    color: '#0078D7',
    borderBottom: '1px solid #0078D7'
  },
  titleTabItemInactive: {
    color: '#666'
  }
}

export default class MailboxWizardMicrosoftConfigureScene extends React.Component {
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
      unreadMode: MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD,
      hoveredUnreadMode: MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user picking next
  */
  handleNext = () => {
    const id = this.props.match.params.mailboxId
    mailboxActions.reduceService(id, MicrosoftDefaultService.type, MicrosoftDefaultServiceReducer.setUnreadMode, this.state.unreadMode)

    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/mailbox_wizard/microsoft/services/' + id
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
              Your Inbox supports multiple unread modes, pick the one below
              that matches the mode you currently use to configure Wavebox
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
                value={MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD })}
                label='Unread Inbox' />
              <RadioButton
                style={styles.radioButton}
                value={MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD })}
                label='Focused Inbox' />
            </RadioButtonGroup>
            <p>
              <small>Hover over each option for more information</small>
            </p>
          </Col>
          <Col xs={6}>
            {hoveredUnreadMode === MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD ? (
              <div>
                <h3 style={styles.modeTitle}>Unread Inbox</h3>
                <Paper style={styles.titleTabContainer}>
                  <div style={styles.titleTabItem}>Inbox</div>
                </Paper>
                <p>
                  Your new emails are sent directly to your Inbox. Typically the title you see above
                  your emails is <em>Inbox</em>.
                </p>
              </div>
            ) : undefined}
            {hoveredUnreadMode === MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD ? (
              <div>
                <h3 style={styles.modeTitle}>Focused Inbox</h3>
                <Paper style={styles.titleTabContainer}>
                  <div style={{...styles.titleTabItem, ...styles.titleTabItemActive}}>Focused</div>
                  <div style={{...styles.titleTabItem, ...styles.titleTabItemInactive}}>Other</div>
                </Paper>
                <p>
                  Your new emails are sorted into Focused and Other Tabs. Typically the title you
                  will see above your emails is a choice between <em>Focused</em> and <em>Other</em>.
                </p>
              </div>
            ) : undefined}
          </Col>
        </Row>
      </Dialog>
    )
  }
}
