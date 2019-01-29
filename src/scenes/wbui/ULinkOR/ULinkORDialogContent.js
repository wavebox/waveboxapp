import React from 'react'
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
import StyleMixins from '../Styles/StyleMixins'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ULinkORRememberInput from './ULinkORRememberInput'

const styles = {
  dialogContent: {
    paddingBottom: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  dialogActions: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 8,
    borderTop: `1px solid ${grey[300]}`
  },
  searchCancelIcon: {
    color: grey[400],
    cursor: 'pointer',
    height: '100%'
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
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    searchTerm: ''
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
  * Sends the remember callbacks to the parent
  * @param windowOpenMode: the window open mode to change to
  * @param windowOpenServiceTarget = undefined: additional service id target that the opener provides
  */
  handleSendRememberCallbacks = (windowOpenMode, windowOpenServiceTarget = undefined) => {
    if (this.rememberInputRef && this.rememberInputRef.current) {
      const type = this.rememberInputRef.current.getType()
      if (type === ULinkORRememberInput.ACTION_TYPES.ACCOUNT) {
        this.props.onChangeMailboxNoMatchWindowOpenRule(windowOpenMode, windowOpenServiceTarget)
      } else if (type === ULinkORRememberInput.ACTION_TYPES.DOMAIN) {
        const match = this.rememberInputRef.current.getMatch()
        this.props.onAddMailboxWindowOpenRule(windowOpenMode, windowOpenServiceTarget, match)
      }
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
      avatarResolver
    } = this.props
    const { searchTerm } = this.state
    return (
      <React.Fragment>
        <DialogTitle disableTypography>
          <Typography variant='h6'>Where would you like to open this link?</Typography>
          <Typography variant='body2' color='textSecondary' noWrap>{targetUrl}</Typography>
          <TextField
            value={searchTerm}
            onChange={this.handleSearchTermChange}
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
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List dense>
            {searchTerm ? undefined : (
              <ULinkORPrimarySection
                onOpenInWaveboxWindow={this.handleOpenInWaveboxWindow}
                onOpenInSystemBrowser={this.handleOpenInSystemBrowser}
                iconResolver={iconResolver} />
            )}
            <ULinkORAccountSection
              searchTerm={searchTerm}
              targetUrl={targetUrl}
              accountStore={accountStore}
              avatarResolver={avatarResolver}
              onOpenInRunningService={this.handleOpenInRunningService}
              onOpenInServiceWindow={this.handleOpenInServiceWindow} />
          </List>
        </DialogContent>
        {serviceId && !isCommandTrigger ? (
          <DialogActions className={classes.dialogActions}>
            <ULinkORRememberInput ref={this.rememberInputRef} targetUrl={targetUrl} />
          </DialogActions>
        ) : undefined}
      </React.Fragment>
    )
  }
}

export default ULinkORDialogContent
