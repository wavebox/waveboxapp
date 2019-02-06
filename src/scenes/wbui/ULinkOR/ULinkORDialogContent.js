import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import {
  DialogTitle, DialogContent, DialogActions,
  Typography, List, TextField, InputAdornment
} from '@material-ui/core'
import ULinkORPrimarySection from './ULinkORPrimarySection'
import ULinkORAccountSection from './ULinkORAccountSection'
import SearchIcon from '@material-ui/icons/Search'
import CancelIcon from '@material-ui/icons/Cancel'
import grey from '@material-ui/core/colors/grey'
import blue from '@material-ui/core/colors/blue'
import StyleMixins from '../Styles/StyleMixins'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ULinkORRememberInput from './ULinkORRememberInput'
import InfoIcon from '@material-ui/icons/Info'

const styles = {
  dialogContent: {
    paddingBottom: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  rememberInput: {
    marginTop: 12
  },
  dialogTitle: {
    borderBottom: `1px solid ${grey[300]}`
  },
  dialogActions: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 8,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 8,
    borderTop: `1px solid ${grey[300]}`
  },
  searchCancelIcon: {
    color: grey[400],
    cursor: 'pointer',
    height: '100%'
  },
  commandTriggerInfo: {
    color: blue[600],
    fontSize: '85%',
    '&>svg': {
      fontSize: '20px',
      verticalAlign: 'middle'
    }
  }
}

@withStyles(styles)
class ULinkORDialogContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    targetUrl: PropTypes.string.isRequired,
    webContentsId: PropTypes.number.isRequired,
    serviceId: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired,
    onOpenLink: PropTypes.func.isRequired,
    onChangeMailboxNoMatchWindowOpenRule: PropTypes.func.isRequired,
    onAddMailboxWindowOpenRule: PropTypes.func.isRequired,
    accountStore: PropTypes.object.isRequired,
    settingsStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired,
    iconResolver: PropTypes.func.isRequired,
    isCommandTrigger: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rememberInputRef = React.createRef()
    this.searchResultsRef = React.createRef()
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    searchTerm: '',
    showCommandTriggerSaveInfo: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the search term changing
  * @param evt: the event that fired
  */
  handleSearchTermChange = (evt) => {
    this.setState({ searchTerm: evt.target.value })
  }

  /**
  * Handles the search clear button being clicked
  * @param evt: the event that fired
  */
  handleSearchClearClick = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    this.setState({ searchTerm: '' })
  }

  /**
  * Handles opening in a wavebox window
  * @param evt: the event that fired
  */
  handleOpenInWaveboxWindow = (evt) => {
    this.handleSendRememberCallbacks(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX, undefined)
    this.props.onOpenLink(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX, undefined)
    this.props.onRequestClose()
  }

  /**
  * Handles opening in a system browser
  * @param evt: the event that fired
  */
  handleOpenInSystemBrowser = (evt) => {
    this.handleSendRememberCallbacks(ACMailbox.USER_WINDOW_OPEN_MODES.BROWSER, undefined)
    this.props.onOpenLink(ACMailbox.USER_WINDOW_OPEN_MODES.BROWSER, undefined)
    this.props.onRequestClose()
  }

  /**
  * Handles opening in a custom link provider
  * @param evt: the event that fired
  * @param linkProviderId: the id of the link provider
  */
  handleOpenInCustomLinkProvider = (evt, linkProviderId) => {
    this.handleSendRememberCallbacks(ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER, linkProviderId)
    this.props.onOpenLink(ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER, linkProviderId)
    this.props.onRequestClose()
  }

  /**
  * Handles opening in a running service
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleOpenInRunningService = (evt, serviceId) => {
    this.handleSendRememberCallbacks(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB, serviceId)
    this.props.onOpenLink(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB, serviceId)
    this.props.onRequestClose()
  }

  /**
  * Handles opening in a service window
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleOpenInServiceWindow = (evt, serviceId) => {
    this.handleSendRememberCallbacks(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW, serviceId)
    this.props.onOpenLink(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW, serviceId)
    this.props.onRequestClose()
  }

  /**
  * Handles opening in a mailbox window
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleOpenInMailboxWindow = (evt, mailboxId) => {
    this.handleSendRememberCallbacks(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW, mailboxId)
    this.props.onOpenLink(ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW, mailboxId)
    this.props.onRequestClose()
  }

  /**
  * Sends the remember callbacks to the parent
  * @param windowOpenMode: the window open mode to change to
  * @param targetInfo = undefined: additional target that the opener provides
  */
  handleSendRememberCallbacks = (windowOpenMode, targetInfo = undefined) => {
    if (this.rememberInputRef && this.rememberInputRef.current) {
      const type = this.rememberInputRef.current.getType()
      // ASK has no effect
      if (type === ULinkORRememberInput.ACTION_TYPES.ACCOUNT) {
        this.props.onChangeMailboxNoMatchWindowOpenRule(windowOpenMode, targetInfo)
      } else if (type === ULinkORRememberInput.ACTION_TYPES.DOMAIN) {
        const match = this.rememberInputRef.current.getMatch()
        this.props.onAddMailboxWindowOpenRule(windowOpenMode, targetInfo, match)
      }
    }
  }

  /**
  * Handles the remember input changing
  * @param evt: the event that fired
  * @param type: the type that's picked
  * @param match: the match info
  */
  handleRememberInputChange = (evt, type, match) => {
    this.setState({
      showCommandTriggerSaveInfo: type !== ULinkORRememberInput.ACTION_TYPES.ASK
    })
  }

  /* **************************************************************************/
  // UI Events: Keyboard navigation
  /* **************************************************************************/

  /**
  * Handles the key down event in the search input
  * @param evt: the event that fired
  */
  handleSearchInputKeydown = (evt) => {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      evt.stopPropagation()
      const targets = this._getResultTargetElements()
      if (!targets[0]) { return }
      targets[0].click()
    } else if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault()
      evt.stopPropagation()
      this._focusKeyboardNextResult(evt.keyCode)
    }
  }

  /**
  * Handles the keydown event in a result
  * @param evt: the event that fired
  */
  handleSearchResultKeydown = (evt) => {
    if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault()
      evt.stopPropagation()
      this._focusKeyboardNextResult(evt.keyCode, evt.target)
    } else if (evt.keyCode !== 13 && evt.keyCode !== 9) { // No control keys
      const inputEl = ReactDOM.findDOMNode(this.searchInputRef.current)
      if (inputEl) {
        inputEl.focus()
      }
    }
  }

  /**
  * @return the dom search result dom targets
  */
  _getResultTargetElements () {
    const resultsEl = ReactDOM.findDOMNode(this.searchResultsRef.current)
    return resultsEl
      ? Array.from(resultsEl.querySelectorAll('[data-ulinkor-keyboard-target="true"]'))
      : []
  }

  /**
  * Focuses the next result
  * @param keyCode: 38 and 40 keycodes to correct 1 and -1
  * @param current=undefined: the current dom element to move from. If undefined assumed search
  */
  _focusKeyboardNextResult (keyCode, current = undefined) {
    const direction = keyCode === 38 ? -1 : 1
    const targets = this._getResultTargetElements()
    if (!targets.length) { return }

    if (current) {
      const currentIndex = targets.findIndex((t) => t === current)
      if (currentIndex === -1) { return }
      const target = targets[currentIndex + direction]
      if (!target) { return }
      target.focus()
    } else {
      const target = (direction === 1 ? targets.slice(0, 1) : targets.slice(-1))[0]
      if (!target) { return }
      target.focus()
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      targetUrl,
      serviceId,
      isCommandTrigger,
      iconResolver,
      classes,
      accountStore,
      settingsStore,
      avatarResolver
    } = this.props
    const {
      searchTerm,
      showCommandTriggerSaveInfo
    } = this.state

    return (
      <React.Fragment>
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <Typography variant='h6'>Where would you like to open this link?</Typography>
          <TextField
            value={searchTerm}
            onChange={this.handleSearchTermChange}
            onKeyDown={this.handleSearchInputKeydown}
            margin='dense'
            variant='outlined'
            autoFocus
            fullWidth
            placeholder='Search'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && searchTerm.length ? (
                <InputAdornment position='end' className={classes.searchCancelIcon} onClick={this.handleSearchClearClick}>
                  <CancelIcon />
                </InputAdornment>
              ) : undefined
            }}
          />
          {serviceId ? (
            <ULinkORRememberInput
              isCommandTrigger={isCommandTrigger}
              className={classes.rememberInput}
              ref={this.rememberInputRef}
              targetUrl={targetUrl}
              onChange={this.handleRememberInputChange} />
          ) : undefined}
          {isCommandTrigger && showCommandTriggerSaveInfo ? (
            <p className={classes.commandTriggerInfo}>
              <InfoIcon /> Some rules created with a keyboard modifier key will
              not be applied when not using the modifier key
            </p>
          ) : undefined}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List dense ref={this.searchResultsRef}>
            {searchTerm ? undefined : (
              <ULinkORPrimarySection
                onOpenInWaveboxWindow={this.handleOpenInWaveboxWindow}
                onOpenInSystemBrowser={this.handleOpenInSystemBrowser}
                onOpenInCustomLinkProvider={this.handleOpenInCustomLinkProvider}
                settingsStore={settingsStore}
                iconResolver={iconResolver}
                onItemKeyDown={this.handleSearchResultKeydown} />
            )}
            <ULinkORAccountSection
              searchTerm={searchTerm}
              targetUrl={targetUrl}
              accountStore={accountStore}
              avatarResolver={avatarResolver}
              onOpenInRunningService={this.handleOpenInRunningService}
              onOpenInServiceWindow={this.handleOpenInServiceWindow}
              onOpenInMailboxWindow={this.handleOpenInMailboxWindow}
              onItemKeyDown={this.handleSearchResultKeydown} />
          </List>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Typography variant='body2' color='textSecondary' noWrap>{targetUrl}</Typography>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default ULinkORDialogContent
