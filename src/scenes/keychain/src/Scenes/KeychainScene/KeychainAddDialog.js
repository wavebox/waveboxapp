import './KeychainAddDialog.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import KeychainStorageInfo from './KeychainStorageInfo'
import {
  Dialog,
  TextField,
  FlatButton,
  RaisedButton,
  Toolbar,
  ToolbarGroup,
  ToolbarTitle
} from 'material-ui'

const styles = {
  dialog: {
    maxWidth: 1024,
    width: '95%'
  },
  toolbar: {
    marginTop: -24,
    marginLeft: -24,
    marginRight: -24
  },
  title: {
    fontSize: '16px',
    lineHeight: '18px',
    marginBottom: 2,
    display: 'block'
  },
  storageInfo: {
    fontSize: '14px',
    lineHeight: '16px',
    display: 'block'
  },
  field: {
    marginTop: -15
  },
  password: {
    backgroundImage: 'none'
  }
}

const ACCOUNT_REF = 'ACCOUNT_REF'
const PASSWORD_REF = 'PASSWORD_REF'
const PASSWORD_REPEAT_REF = 'PASSWORD_REPEAT_REF'

export default class KeychainAddDialog extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceName: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    currentAccountNames: PropTypes.array.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({
        account: '',
        accountError: '',
        password: '',
        passwordError: '',
        passwordRepeat: '',
        passwordRepeatError: ''
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    account: '',
    accountError: '',
    password: '',
    passwordError: '',
    passwordRepeat: '',
    passwordRepeatError: ''
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  /**
  * Handles the user pressing save
  */
  handleSave = () => {
    const account = this.state.account.trim()
    const password = this.state.password.trim()
    const passwordRepeat = this.state.passwordRepeat.trim()

    const stateUpdate = {
      accountError: '',
      passwordError: '',
      passwordRepeatError: ''
    }
    let hasError = false

    if (!account.length) {
      stateUpdate.accountError = 'This field is required'
      hasError = true
    } else {
      if (new Set(this.props.currentAccountNames).has(account)) {
        stateUpdate.accountError = 'An account with this name already exists'
        hasError = true
      }
    }
    if (!password.length) {
      stateUpdate.passwordError = 'This field is required'
      hasError = true
    }
    if (!passwordRepeat.length) {
      stateUpdate.passwordRepeatError = 'This field is required'
      hasError = true
    }
    if (password.length && passwordRepeat.length && password !== passwordRepeat) {
      stateUpdate.passwordError = 'Passwords must match'
      stateUpdate.passwordRepeatError = 'Passwords must match'
      hasError = true
    }

    this.setState(stateUpdate)
    if (!hasError) {
      this.props.onSave(account, password)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceName, open, onRequestClose } = this.props
    const {
      account,
      accountError,
      password,
      passwordError,
      passwordRepeat,
      passwordRepeatError
    } = this.state

    return (
      <Dialog
        actions={(
          <div>
            <FlatButton
              style={{ marginRight: 8 }}
              onClick={onRequestClose}
              label='Cancel' />
            <RaisedButton
              primary
              onClick={this.handleSave}
              label='Save' />
          </div>
        )}
        contentStyle={styles.dialog}
        bodyClassName='ReactComponent-KeychainAddDialogBody'
        modal={false}
        open={open}
        autoScrollBodyContent
        onRequestClose={onRequestClose}>
        <Toolbar style={styles.toolbar}>
          <ToolbarGroup>
            <ToolbarTitle
              text={(
                <span>
                  <span style={styles.title}>
                    <strong>Add password for </strong>
                    <span>{serviceName}</span>
                  </span>
                  <KeychainStorageInfo style={styles.storageInfo} />
                </span>
              )} />
          </ToolbarGroup>
        </Toolbar>
        <TextField
          ref={ACCOUNT_REF}
          value={account}
          errorText={accountError}
          fullWidth
          style={styles.field}
          onChange={(evt) => this.setState({account: evt.target.value})}
          onKeyPress={(evt) => {
            if (evt.key === 'Enter') {
              this.refs[PASSWORD_REF].focus()
            }
          }}
          floatingLabelText='Account Name'
          hintText='My Account Name' />
        <br />
        <TextField
          ref={PASSWORD_REF}
          value={password}
          errorText={passwordError}
          fullWidth
          onChange={(evt) => this.setState({password: evt.target.value})}
          onKeyPress={(evt) => {
            if (evt.key === 'Enter') {
              this.refs[PASSWORD_REPEAT_REF].focus()
            }
          }}
          type='password'
          style={styles.field}
          inputStyle={styles.password}
          floatingLabelText='Password' />
        <br />
        <TextField
          ref={PASSWORD_REPEAT_REF}
          value={passwordRepeat}
          errorText={passwordRepeatError}
          fullWidth
          onChange={(evt) => this.setState({passwordRepeat: evt.target.value})}
          onKeyPress={(evt) => {
            if (evt.key === 'Enter') {
              this.handleSave()
            }
          }}
          type='password'
          style={styles.field}
          inputStyle={styles.password}
          floatingLabelText='Repeat Password' />
      </Dialog>
    )
  }
}
