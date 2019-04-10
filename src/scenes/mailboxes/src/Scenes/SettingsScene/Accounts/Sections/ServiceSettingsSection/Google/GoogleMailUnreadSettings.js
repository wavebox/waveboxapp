import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import CoreGoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/CoreGoogleMailServiceReducer'
import CoreGoogleMailService from 'shared/Models/ACAccounts/Google/CoreGoogleMailService'
import WBRPCRenderer from 'shared/WBRPCRenderer'

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
      inboxType: service.inboxType
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
      </SettingsListSection>
    )
  }
}

export default GoogleMailUnreadSettings
