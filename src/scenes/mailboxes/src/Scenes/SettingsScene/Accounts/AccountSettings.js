import PropTypes from 'prop-types'
import React from 'react'
import mailboxStore from 'stores/mailbox/mailboxStore'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import CustomCodeEditingDialog from './CustomCodeEditingDialog'
import RestrictedAccountSettings from './RestrictedAccountSettings'
import GoogleAccountSettings from './Google/GoogleAccountSettings'
import SlackAccountSettings from './Slack/SlackAccountSettings'
import TrelloAccountSettings from './Trello/TrelloAccountSettings'
import GenericAccountSettings from './Generic/GenericAccountSettings'
import MicrosoftAccountSettings from './Microsoft/MicrosoftAccountSettings'
import ContainerAccountSettings from './Container/ContainerAccountSettings'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import grey from '@material-ui/core/colors/grey'

const styles = {
  addFirstAccountContainer: {
    textAlign: 'center'
  },
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
  },
  heading: {
    marginTop: 30,
    color: grey[900],
    fontWeight: 'normal',
    marginBottom: 10
  },
  headingInfo: {
    marginTop: -10,
    marginBottom: 10,
    color: grey[700]
  }
}

@withStyles(styles)
class AccountSettings extends React.Component {
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
  handleAccountChange = (evt) => {
    window.location.hash = `/settings/accounts/${evt.target.value}`
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
    const {
      showRestart,
      mailboxId,
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <div className={classNames(className, classes.addFirstAccountContainer)} {...passProps}>
        <Button variant='raised' color='primary' onClick={this.handleAddAccount}>
          Add your first account
        </Button>
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
      case CoreMailbox.MAILBOX_TYPES.CONTAINER:
        return (
          <ContainerAccountSettings
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
    const { mailboxId, showRestart, classes, ...passProps } = this.props
    const { mailboxes, codeEditorOpen, codeEditorTitle, codeEditorCode } = this.state
    const selected = mailboxes.find((mailbox) => mailbox.id === mailboxId) || mailboxes[0]
    const isSelectedRestricted = mailboxStore.getState().isMailboxRestricted(selected.id) // Bad

    return (
      <div {...passProps}>
        <div style={styles.accountPicker}>
          <MailboxAvatar
            mailboxId={selected.id}
            size={60}
            className={classes.accountPickerAvatar} />
          <div className={classes.accountPickerContainer}>
            <FormControl fullWidth>
              <InputLabel>Pick your account</InputLabel>
              <Select
                value={selected.id}
                fullWidth
                onChange={this.handleAccountChange} >
                {mailboxes.map((m) => {
                  return (
                    <MenuItem value={m.id} key={m.id}>
                      {`${m.humanizedType} : ${m.displayName}`}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </div>
        </div>
        {isSelectedRestricted ? (
          <RestrictedAccountSettings mailboxId={mailboxId} />
        ) : (
          <div>
            <h1 className={classes.heading}>Account</h1>
            <p className={classes.headingInfo}>
              <strong>{selected.humanizedType}</strong> {selected.displayName}
            </p>
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

export default AccountSettings
