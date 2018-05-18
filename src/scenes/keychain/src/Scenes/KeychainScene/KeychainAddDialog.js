import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import KeychainStorageInfo from './KeychainStorageInfo'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Toolbar, Typography, TextField, Button
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import StyleMixins from 'wbui/Styles/StyleMixins'

const styles = {
  toolbar: {
    backgroundColor: grey[200]
  },
  toolbarText: {
    color: grey[600]
  },
  dialogTitle: {
    padding: 0
  },
  dialogContent: {
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
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
  actionButton: {
    marginRight: 8
  }
}

@withStyles(styles)
class KeychainAddDialog extends React.Component {
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
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.accountInputRef = undefined
    this.passwordInputRef = undefined
    this.passwordRepeatInputRef = undefined
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
    const { serviceName, open, onRequestClose, classes } = this.props
    const {
      account,
      accountError,
      password,
      passwordError,
      passwordRepeat,
      passwordRepeatError
    } = this.state

    return (
      <Dialog open={open} onClose={onRequestClose} fullWidth>
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <Toolbar className={classes.toolbar}>
            <Typography className={classes.toolbarText}>
              <span>
                <span className={classes.title}>
                  <strong>Add password for </strong>
                  <span>{serviceName}</span>
                </span>
                <KeychainStorageInfo className={classes.storageInfo} />
              </span>
            </Typography>
          </Toolbar>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            inputRef={(n) => { this.accountInputRef = n }}
            value={account}
            error={!!accountError}
            helperText={accountError}
            fullWidth
            margin='dense'
            onChange={(evt) => this.setState({account: evt.target.value})}
            onKeyPress={(evt) => {
              if (evt.key === 'Enter') {
                this.passwordInputRef.focus()
              }
            }}
            label='Account Name'
            placeholder='My Account Name' />
          <br />
          <TextField
            inputRef={(n) => { this.passwordInputRef = n }}
            value={password}
            error={!!passwordError}
            helperText={passwordError}
            fullWidth
            margin='dense'
            onChange={(evt) => this.setState({password: evt.target.value})}
            onKeyPress={(evt) => {
              if (evt.key === 'Enter') {
                this.passwordRepeatInputRef.focus()
              }
            }}
            type='password'
            label='Password' />
          <br />
          <TextField
            inputRef={(n) => { this.passwordRepeatInputRef = n }}
            value={passwordRepeat}
            error={!!passwordRepeatError}
            helperText={passwordRepeatError}
            fullWidth
            margin='dense'
            onChange={(evt) => this.setState({passwordRepeat: evt.target.value})}
            onKeyPress={(evt) => {
              if (evt.key === 'Enter') {
                this.handleSave()
              }
            }}
            type='password'
            label='Repeat Password' />
        </DialogContent>
        <DialogActions>
          <Button
            className={classes.actionButton}
            onClick={onRequestClose}>
            Cancel
          </Button>
          <Button
            className={classes.actionButton}
            variant='raised'
            color='primary'
            onClick={this.handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default KeychainAddDialog
