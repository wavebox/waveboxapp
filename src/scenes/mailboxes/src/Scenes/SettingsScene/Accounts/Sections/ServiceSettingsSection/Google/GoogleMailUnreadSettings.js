import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import SettingsListTypography from 'wbui/SettingsListTypography'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import CoreGoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/CoreGoogleMailServiceReducer'
import CoreGoogleMailService from 'shared/Models/ACAccounts/Google/CoreGoogleMailService'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'

const styles = {
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
      ...this.extractStateForService(this.props.serviceId, accountState),
      disableSleepForImmediateSyncOpen: false
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
      inboxType: service.inboxType,
      syncInterval: service.syncInterval,
      sleepable: service.sleepable
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
  * Sets the sync interval
  * @param evt: the event that fired
  * @param value: the value
  */
  handleSetSyncInterval = (evt, value) => {
    if (value === 0) {
      this.setState({ disableSleepForImmediateSyncOpen: true })
    } else {
      accountActions.reduceService(
        this.props.serviceId,
        CoreGoogleMailServiceReducer.setSyncInterval,
        value
      )
    }
  }

  /**
  * Closes the sleep dialog
  * @param evt: the event that fired
  */
  handleSleepDialogClose = (evt) => {
    this.setState({ disableSleepForImmediateSyncOpen: false })
  }

  /**
  * Enables sleep from the dialog and closes it
  * @param evt: the event that fired
  */
  handleDisableSleepFromDialog = (evt) => {
    this.setState({ disableSleepForImmediateSyncOpen: false })
    accountActions.reduceService(
      this.props.serviceId,
      CoreGoogleMailServiceReducer.setSyncInterval,
      30000
    )
    accountActions.reduceService(
      this.props.serviceId,
      CoreGoogleMailServiceReducer.setSleepable,
      false
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      classes,
      ...passProps
    } = this.props
    const {
      hasService,
      inboxType,
      syncInterval,
      sleepable,
      disableSleepForImmediateSyncOpen
    } = this.state
    if (!hasService) { return false }

    return (
      <React.Fragment>
        <SettingsListSection title='Unread & Sync' {...passProps}>
          <SettingsListItemSelect
            label={(
              <React.Fragment>
                Inbox Type <a href='#' className={classes.link} onClick={this.handleOpenInboxTypeKB}>Need some help?</a>
              </React.Fragment>
            )}
            value={inboxType}
            options={[
              { value: CoreGoogleMailService.INBOX_TYPES.GMAIL_DEFAULT, label: 'Default (Categories or tabs)' },
              { value: CoreGoogleMailService.INBOX_TYPES.GMAIL_IMPORTANT, label: 'Important first' },
              { value: CoreGoogleMailService.INBOX_TYPES.GMAIL_UNREAD, label: 'Unread first' },
              { value: CoreGoogleMailService.INBOX_TYPES.GMAIL_STARRED, label: 'Starred first' },
              { value: CoreGoogleMailService.INBOX_TYPES.GMAIL_PRIORITY, label: 'Priority Inbox' }
            ]}
            onChange={(evt, value) => {
              accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setInboxType, value)
            }} />
          <SettingsListItemSelect
            divider={false}
            label='Sync interval'
            disabled={!sleepable}
            value={sleepable ? syncInterval : 0}
            options={[
              { value: 0, label: 'Immediate' },
              { value: 30000, label: '30 seconds' },
              { value: 60000, label: '1 Minute' },
              { value: 120000, label: '2 Minutes' },
              { value: 300000, label: '5 minutes' }
            ]}
            onChange={this.handleSetSyncInterval}>
            {sleepable ? undefined : (
              <SettingsListTypography
                type='info'
                variant='select-help'
                icon={<CheckCircleIcon />}>
                Sync is immediate when sleep is disabled on this service
              </SettingsListTypography>
            )}
          </SettingsListItemSelect>
        </SettingsListSection>
        <Dialog open={disableSleepForImmediateSyncOpen} onClose={this.handleSleepDialogClose}>
          <DialogTitle>Disable sleep?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Immediate sync is only available when sleep is disabled
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSleepDialogClose}>
              Cancel
            </Button>
            <Button onClick={this.handleDisableSleepFromDialog} color='primary' autoFocus>
              Disable Sleep
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default GoogleMailUnreadSettings
