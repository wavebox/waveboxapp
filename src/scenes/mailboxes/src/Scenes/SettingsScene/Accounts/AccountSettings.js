import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import CustomCodeEditingDialog from './CustomCodeEditingDialog'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { Button } from '@material-ui/core'
import AccountPickerBanner from './AccountPickerBanner'
import AccountSettingsScroller from './AccountSettingsScroller'

const styles = {
  accountContent: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    bottom: 0
  },
  addFirstAccountContainer: {
    marginTop: 36,
    textAlign: 'center'
  }
}

@withStyles(styles)
class AccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    mailboxId: PropTypes.string,
    serviceId: PropTypes.string
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState({
        selectedMailboxId: nextProps.mailboxId || accountStore.getState().mailboxIds()[0],
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
    const accountState = accountStore.getState()
    return {
      accountCount: accountState.mailboxCount(),
      selectedMailboxId: this.props.mailboxId || accountState.mailboxIds()[0],
      codeEditorOpen: false,
      codeEditorTitle: undefined,
      codeEditorCode: '',
      codeEditorSaveFn: undefined
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      accountCount: accountState.mailboxCount(),
      selectedMailboxId: this.props.mailboxId || accountState.mailboxIds()[0]
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles chaning the account
  * @param mailboxId: the id of the mailbox
  */
  handleAccountChange = (mailboxId) => {
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

  render () {
    const {
      mailboxId,
      serviceId,
      showRestart,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      accountCount,
      selectedMailboxId,
      codeEditorOpen,
      codeEditorTitle,
      codeEditorCode
    } = this.state

    if (accountCount) {
      // Push the key down to force a complete re-render when changing account. We do this to support a staged render
      return (
        <div
          key={mailboxId}
          {...passProps}>
          <AccountPickerBanner
            selectedMailboxId={selectedMailboxId}
            onChange={this.handleAccountChange} />
          <div className={classes.accountContent}>
            <AccountSettingsScroller
              mailboxId={selectedMailboxId}
              startServiceId={serviceId}
              showRestart={showRestart}
              onRequestEditCustomCode={this.handleEditCustomCode} />
            <CustomCodeEditingDialog
              title={codeEditorTitle}
              open={codeEditorOpen}
              code={codeEditorCode}
              onCancel={this.handleCancelCustomCode}
              onSave={this.handleSaveCustomCode} />
          </div>
        </div>
      )
    } else {
      return (
        <div className={classNames(className, classes.addFirstAccountContainer)} {...passProps}>
          <Button variant='raised' color='primary' onClick={this.handleAddAccount}>
            Add your first account
          </Button>
        </div>
      )
    }
  }
}

export default AccountSettings
