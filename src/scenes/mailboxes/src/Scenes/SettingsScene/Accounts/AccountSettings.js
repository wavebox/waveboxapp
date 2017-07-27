import PropTypes from 'prop-types'
import React from 'react'
import {SelectField, MenuItem, RaisedButton} from 'material-ui'
import mailboxStore from 'stores/mailbox/mailboxStore'
import userStore from 'stores/user/userStore'
import * as Colors from 'material-ui/styles/colors'
import commonStyles from '../CommonSettingStyles'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import CustomCodeEditingDialog from './CustomCodeEditingDialog'
import RestrictedAccountSettings from './RestrictedAccountSettings'
import GoogleAccountSettings from './Google/GoogleAccountSettings'
import SlackAccountSettings from './Slack/SlackAccountSettings'
import TrelloAccountSettings from './Trello/TrelloAccountSettings'
import GenericAccountSettings from './Generic/GenericAccountSettings'
import MicrosoftAccountSettings from './Microsoft/MicrosoftAccountSettings'
import { Row, Col } from 'Components/Grid'
import { MailboxAvatar } from 'Components/Mailbox'

const styles = {
  accountPicker: {
    position: 'relative',
    height: 100,
    marginTop: -24
  },
  accountPickerAvatar: {
    position: 'absolute',
    top: 20,
    left: 20
  },
  accountPickerContainer: {
    position: 'absolute',
    top: 25,
    left: 100,
    right: 15
  }
}

export default class AccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    mailboxId: PropTypes.string
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState({
        codeEditorOpen: false,
        codeEditorTitle: undefined,
        codeEditorCode: '',
        codeEditorSaveFn: undefined
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()
    return {
      mailboxes: mailboxState.allMailboxes(),
      codeEditorOpen: false,
      codeEditorTitle: undefined,
      codeEditorCode: '',
      codeEditorSaveFn: undefined
    }
  })()

  mailboxesChanged = (mailboxState) => {
    const all = mailboxState.allMailboxes()
    this.setState({ mailboxes: all })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles chaning the account
  * @param evt: the event that fired
  * @param index: the index of the first option
  * @param mailboxId: the id of the mailbox
  */
  handleAccountChange = (evt, index, mailboxId) => {
    window.location.hash = `/settings/accounts/${mailboxId}`
  }

  /**
  * Opens the add account dialog
  */
  handleAddAccount = () => {
    window.location.hash = `/mailbox_wizard/add`
  }

  /**
  * Starts editing the custom code
  * @param title: the dialog title
  * @param code: the code for the dialog
  * @param save: the save function
  */
  handleEditCustomCode = (title, code, save) => {
    this.setState({
      codeEditorOpen: true,
      codeEditorTitle: title,
      codeEditorCode: code || '',
      codeEditorSaveFn: save
    })
  }

  /**
  * Handles saving the custom code
  * @param evt: the event that fired
  * @param code: the code to save
  */
  handleSaveCustomCode = (evt, code) => {
    if (this.state.codeEditorSaveFn) {
      this.state.codeEditorSaveFn(code)
    }
    this.handleCancelCustomCode(evt)
  }

  /**
  * Handles cancelling the custom code
  * @param evt: the event that fired
  */
  handleCancelCustomCode = (evt) => {
    this.setState({
      codeEditorOpen: false,
      codeEditorTitle: undefined,
      codeEditorCode: '',
      codeEditorSaveFn: undefined
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders no mailboxes
  * @return jsx
  */
  renderNoMailboxes () {
    const passProps = Object.assign({}, this.props)
    delete passProps.showRestart
    delete passProps.mailboxId

    return (
      <div {...passProps}>
        <div style={{ textAlign: 'center' }}>
          <RaisedButton
            label='Add your first account'
            primary
            onClick={this.handleAddAccount} />
        </div>
      </div>
    )
  }

  /**
  * Renders the settings for the type of mailbox
  * @param mailbox: the mailbox to render for
  * @param showRestart: the show restart function
  * @return jsx
  */
  renderMailboxSettings (mailbox, showRestart) {
    switch (mailbox.type) {
      case CoreMailbox.MAILBOX_TYPES.GOOGLE:
        return (
          <GoogleAccountSettings
            mailbox={mailbox}
            showRestart={showRestart}
            onRequestEditCustomCode={this.handleEditCustomCode} />)
      case CoreMailbox.MAILBOX_TYPES.SLACK:
        return (
          <SlackAccountSettings
            mailbox={mailbox}
            showRestart={showRestart}
            onRequestEditCustomCode={this.handleEditCustomCode} />)
      case CoreMailbox.MAILBOX_TYPES.TRELLO:
        return (
          <TrelloAccountSettings
            mailbox={mailbox}
            showRestart={showRestart}
            onRequestEditCustomCode={this.handleEditCustomCode} />)
      case CoreMailbox.MAILBOX_TYPES.MICROSOFT:
        return (
          <MicrosoftAccountSettings
            mailbox={mailbox}
            showRestart={showRestart}
            onRequestEditCustomCode={this.handleEditCustomCode} />)
      case CoreMailbox.MAILBOX_TYPES.GENERIC:
        return (
          <GenericAccountSettings
            mailbox={mailbox}
            showRestart={showRestart}
            onRequestEditCustomCode={this.handleEditCustomCode} />)
      default: return undefined
    }
  }

  /**
  * Renders the mailbox picker and the settings
  * @return jsx
  */
  renderMailboxes () {
    const { mailboxId, showRestart, ...passProps } = this.props
    const { mailboxes, codeEditorOpen, codeEditorTitle, codeEditorCode } = this.state
    const selected = mailboxes.find((mailbox) => mailbox.id === mailboxId) || mailboxes[0]
    const isSelectedRestricted = mailboxStore.getState().isMailboxRestricted(selected.id, userStore.getState().user) // Bad

    return (
      <div {...passProps}>
        <Row>
          <Col md={8} offset={2} style={styles.accountPicker}>
            <MailboxAvatar
              mailbox={selected}
              size={60}
              style={styles.accountPickerAvatar} />
            <div style={styles.accountPickerContainer}>
              <SelectField
                value={selected.id}
                style={{marginTop: -14}}
                floatingLabelText='Pick your account'
                floatingLabelStyle={{color: Colors.blue600}}
                fullWidth
                onChange={this.handleAccountChange}>
                {
                  this.state.mailboxes.map((m) => {
                    return (
                      <MenuItem
                        value={m.id}
                        key={m.id}
                        primaryText={m.displayName + ' (' + m.humanizedType + ')'} />
                    )
                  })
                }
              </SelectField>
            </div>
          </Col>
        </Row>
        {isSelectedRestricted ? (
          <RestrictedAccountSettings mailboxId={mailboxId} />
        ) : (
          <div>
            <Row>
              <Col md={12}>
                <h1 style={commonStyles.heading}>Account</h1>
                <p style={commonStyles.headingInfo}>
                  <strong>{selected.humanizedType}</strong> {selected.displayName}
                </p>
              </Col>
            </Row>
            {this.renderMailboxSettings(selected, showRestart)}
            <CustomCodeEditingDialog
              title={codeEditorTitle}
              open={codeEditorOpen}
              code={codeEditorCode}
              onCancel={this.handleCancelCustomCode}
              onSave={this.handleSaveCustomCode} />
          </div>
        )}
      </div>
    )
  }

  render () {
    if (this.state.mailboxes.length) {
      return this.renderMailboxes()
    } else {
      return this.renderNoMailboxes()
    }
  }
}
