import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import SettingsListItem from 'wbui/SettingsListItem'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import { Button, ListItemSecondaryAction, ListItemText, Dialog } from '@material-ui/core'
import CoreGoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/CoreGoogleMailServiceReducer'
import CoreGoogleMailService from 'shared/Models/ACAccounts/Google/CoreGoogleMailService'
import GoogleMailCustomUnreadDialogContent from './GoogleMailCustomUnreadDialogContent'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  customUnreadModeListItem: {
    paddingRight: 80
  },
  customUnreadModeIndicator: {
    display: 'inline-block',
    marginTop: 10
  },
  customUnreadModeIconIndicator: {
    width: 18,
    height: 18,
    marginRight: 6,
    verticalAlign: 'bottom'
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[600]
  }
}

@withStyles(styles)
class GoogleMailUnreadSettings extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState(
        this.extractStateForService(nextProps.serviceId, accountState)
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      customUnreadDialogOpen: false,
      ...this.extractStateForService(this.props.serviceId, accountState)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      serviceType: service.type,
      inboxType: service.inboxType,
      supportedInboxTypes: Array.from(service.supportedInboxTypes),
      hasCustomQueryConfiguration: !!service.customUnreadQuery || !!service.customUnreadLabelWatchString
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the inbox type KB
  * @param evt: the event that fired
  */
  handleOpenInboxTypeKB = (evt) => {
    evt.preventDefault()
    WBRPCRenderer.wavebox.openExternal('https://wavebox.io/kb/gmail-inbox-type')
  }

  /**
  * Opens the custom unread dialog
  */
  handleOpenCustomUnreadDialog = () => {
    this.setState({ customUnreadDialogOpen: true })
  }

  /**
  * Closes the custom unread dialog
  */
  handleCloseCustomUnreadDialog = () => {
    this.setState({ customUnreadDialogOpen: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Turns an unread mode into a friendlier string
  * @param type: the inbox type
  * @param serviceType: the type of service
  * @return the humanized version
  */
  humanizeInboxType (type, serviceType) {
    switch (type) {
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT: return 'Default (Categories or tabs)'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT: return 'Important first'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD:
        return serviceType === CoreGoogleMailService.SERVICE_TYPES.GOOGLE_INBOX
          ? 'All unread messages'
          : 'Unread first'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED: return 'Starred first'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY: return 'Priority Inbox'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT_ATOM: return 'Default (Categories or tabs) (Experimental counts)'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT_ATOM: return 'Important first (Experimental counts)'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD_ATOM: return 'Unread first (Experimental counts)'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED_ATOM: return 'Starred first (Experimental counts)'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY_ATOM: return 'Priority Inbox (Experimental counts)'
      case CoreGoogleMailService.INBOX_TYPES.GMAIL__ALL: return 'All messages (Read & Unread)'
      case CoreGoogleMailService.INBOX_TYPES.GINBOX_UNBUNDLED: return 'Unread Unbundled Messages'
    }
  }

  /**
  * Renders the inbox type settings. This is basically a shim around supportedInboxTypes so we can have
  * dividers within the list. Once Google Inbox has been turned off by Google and we've removed it from
  * the Wavebox codebase, we can look to simplify this
  * @param serviceType: the service type to render for
  * @param supportedInboxTypes: the list of supported inbox type from the model
  * @return an array that can be passed to the list
  */
  renderInboxTypeSettings (serviceType, supportedInboxTypes) {
    if (serviceType === CoreGoogleMailService.SERVICE_TYPES.GOOGLE_MAIL) {
      const userCommon = new Set([
        CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT,
        CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT,
        CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD,
        CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED,
        CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY
      ])

      return [].concat(
        Array.from(userCommon).map((type) => {
          return { value: type, label: this.humanizeInboxType(type, serviceType) }
        }),
        [{ divider: true }],
        supportedInboxTypes
          .filter((type) => !userCommon.has(type))
          .map((type) => {
            return { value: type, label: this.humanizeInboxType(type, serviceType) }
          })
      )
    } else {
      // Depricated Google Inbox types
      return supportedInboxTypes.map((type) => {
        return { value: type, label: this.humanizeInboxType(type, serviceType) }
      })
    }
  }

  render () {
    const {
      serviceId,
      classes,
      ...passProps
    } = this.props
    const {
      hasService,
      hasCustomQueryConfiguration,
      customUnreadDialogOpen,
      inboxType,
      supportedInboxTypes,
      serviceType
    } = this.state
    if (!hasService) { return false }

    return (
      <SettingsListSection title='Unread & Sync' {...passProps}>
        <SettingsListItemSelect
          label={serviceType === CoreGoogleMailService.SERVICE_TYPES.GOOGLE_MAIL ? (
            <React.Fragment>
              Inbox Type <a href='#' className={classes.link} onClick={this.handleOpenInboxTypeKB}>Need some help?</a>
            </React.Fragment>
          ) : ('Inbox Type')}
          disabled={hasCustomQueryConfiguration}
          value={inboxType}
          options={this.renderInboxTypeSettings(serviceType, supportedInboxTypes)}
          onChange={(evt, value) => {
            accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setInboxType, value)
          }} />
        <SettingsListItem className={classes.customUnreadModeListItem} divider={false}>
          <ListItemText
            primary={(
              <span>
                A custom unread mode can be used to configure Wavebox to provide
                Notifications and Badges for a custom set of messages
              </span>
            )}
            secondary={(
              <span className={classes.customUnreadModeIndicator}>
                {hasCustomQueryConfiguration ? (
                  <CheckBoxIcon className={classes.customUnreadModeIconIndicator} />
                ) : (
                  <CheckBoxOutlineIcon className={classes.customUnreadModeIconIndicator} />
                )}
                Using custom unread mode
              </span>
            )} />
          <ListItemSecondaryAction>
            <Button variant='contained' size='small' onClick={this.handleOpenCustomUnreadDialog}>
              Configure
            </Button>
          </ListItemSecondaryAction>
        </SettingsListItem>
        <Dialog
          disableEnforceFocus
          open={customUnreadDialogOpen}
          onClose={this.handleCloseCustomUnreadDialog}>
          <GoogleMailCustomUnreadDialogContent
            serviceId={serviceId}
            onRequestClose={this.handleCloseCustomUnreadDialog} />
        </Dialog>
      </SettingsListSection>
    )
  }
}

export default GoogleMailUnreadSettings
