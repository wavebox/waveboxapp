import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Resolver from 'Runtime/Resolver'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from '@material-ui/core/styles'
import { Avatar, Tooltip, IconButton } from '@material-ui/core'
import grey from '@material-ui/core/colors/grey'
import { accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import DeleteIcon from '@material-ui/icons/Delete'
import RestrictedServiceSection from './RestrictedServiceSection'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import DefaultServiceSettings from './DefaultServiceSettings'
import GoogleMailServiceSettings from './Google/GoogleMailServiceSettings'
import MicrosoftMailServiceSettings from './Microsoft/MicrosoftMailServiceSettings'
import TrelloServiceSettings from './Trello/TrelloServiceSettings'
import GenericServiceSettings from './Generic/GenericServiceSettings'
import ContainerServiceSettings from './Container/ContainerServiceSettings'

const styles = {
  toolbar: {
    backgroundColor: grey[300],
    flexDirection: 'row',
    marginTop: -4,
    marginBottom: -4,
    height: 47
  },
  toolbarInfo: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  toolbarControls: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  serviceAvatar: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    border: '2px solid rgb(139, 139, 139)',
    marginRight: 6
  },
  childrenWrap: {
    paddingLeft: 12,
    paddingRight: 12
  }
}

@withStyles(styles)
class ServiceSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.extractStateForMailbox(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  userChanged = (userState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountStore.getState())
    )
  }

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
      mailboxId: service.parentId,
      logo: service.humanizedLogoAtSize(128),
      displayName: accountState.resolvedServiceDisplayName(serviceId),
      humanizedType: service.humanizedType,
      isRestricted: accountState.isServiceRestricted(serviceId),
      serviceType: service.type
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the service section
  * @param serviceId: the id of the service
  * @param serviceType: the type of the service
  * @param showRestart: the function to show the restart button
  * @param onRequestEditCustomCode: the function to edit custom code
  */
  renderSettings (serviceId, serviceType, showRestart, onRequestEditCustomCode) {
    let RenderClass
    switch (serviceType) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
        RenderClass = GoogleMailServiceSettings
        break
      case SERVICE_TYPES.MICROSOFT_MAIL:
        RenderClass = MicrosoftMailServiceSettings
        break
      case SERVICE_TYPES.TRELLO:
        RenderClass = TrelloServiceSettings
        break
      case SERVICE_TYPES.GENERIC:
        RenderClass = GenericServiceSettings
        break
      case SERVICE_TYPES.CONTAINER:
        RenderClass = ContainerServiceSettings
        break
      default:
        RenderClass = DefaultServiceSettings
    }

    if (DefaultServiceSettings) {
      return <RenderClass serviceId={serviceId} showRestart={showRestart} onRequestEditCustomCode={onRequestEditCustomCode} />
    } else {
      return undefined
    }
  }

  render () {
    const {
      classes,
      serviceId,
      showRestart,
      onRequestEditCustomCode,
      ...passProps
    } = this.props
    const {
      hasService,
      mailboxId,
      logo,
      displayName,
      humanizedType,
      isRestricted,
      serviceType
    } = this.state
    if (!hasService) { return false }

    return (
      <SettingsListSection {...passProps}>
        <SettingsListItem className={classes.toolbar}>
          <div className={classes.toolbarInfo}>
            <Avatar
              className={classes.serviceAvatar}
              src={Resolver.image(logo)} />
            {displayName || humanizedType}
          </div>
          <div>
            <Tooltip title='Remove'>
              <div>
                <IconButton
                  onClick={() => { window.location.hash = `/mailbox_service_delete/${mailboxId}/${serviceId}` }}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </Tooltip>
          </div>
        </SettingsListItem>
        <div className={classes.childrenWrap}>
          {isRestricted ? (
            <RestrictedServiceSection serviceId={serviceId} />
          ) : (
            this.renderSettings(serviceId, serviceType, showRestart, onRequestEditCustomCode)
          )}
        </div>
      </SettingsListSection>
    )
  }
}

export default ServiceSettingsSection
