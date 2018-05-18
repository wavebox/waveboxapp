import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountServicesHeading from '../AccountServicesHeading'
import AccountServicesSettings from '../AccountServicesSettings'
import AccountDestructiveSettings from '../AccountDestructiveSettings'
import CoreService from 'shared/Models/Accounts/CoreService'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { userStore } from 'stores/user'
import GoogleDefaultServiceSettings from './GoogleDefaultServiceSettings'
import GoogleServiceSettings from './GoogleServiceSettings'
import { mailboxActions, GoogleMailboxReducer } from 'stores/mailbox'
import Resolver from 'Runtime/Resolver'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import { withStyles } from 'material-ui/styles'
import { Button, Icon, Avatar } from 'material-ui'

const styles = {
  proServices: {
    textAlign: 'center'
  },
  proServiceAvatars: {
    marginTop: 8,
    marginBottom: 8
  },
  serviceAvatar: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    marginRight: 8,
    border: '2px solid rgb(139, 139, 139)'
  }
}

@withStyles(styles)
class GoogleAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      userHasServices: userStore.getState().user.hasServices
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens wavebox purchase
  */
  openWaveboxPro = () => {
    window.location.hash = '/pro'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the service type
  * @param mailbox: the current mailbox
  * @param serviceType: the type of service we are rendering for
  * @param onRequestEditCustomCode: the function call to open the edit custom code modal
  * @return jsx
  */
  renderServiceType (mailbox, serviceType, onRequestEditCustomCode) {
    switch (serviceType) {
      case CoreService.SERVICE_TYPES.DEFAULT:
        return (
          <GoogleDefaultServiceSettings
            key={serviceType}
            mailbox={mailbox}
            onRequestEditCustomCode={onRequestEditCustomCode} />)
      default:
        return (
          <GoogleServiceSettings
            key={serviceType}
            mailbox={mailbox}
            serviceType={serviceType}
            onRequestEditCustomCode={onRequestEditCustomCode} />)
    }
  }

  render () {
    const { classes, mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const { userHasServices } = this.state

    return (
      <div {...passProps}>
        <AccountAppearanceSettings mailbox={mailbox} />
        <AccountServicesSettings mailbox={mailbox} />
        <AccountAdvancedSettings
          mailbox={mailbox}
          showRestart={showRestart}
          windowOpenAfter={(
            <SettingsListSwitch
              label='Open Google Drive links with browser'
              onChange={(evt, toggled) => {
                mailboxActions.reduce(mailbox.id, GoogleMailboxReducer.setOpenDriveLinksWithExternalBrowser, toggled)
              }}
              checked={mailbox.openDriveLinksWithExternalBrowser} />
          )}
        />
        <AccountDestructiveSettings mailbox={mailbox} />
        <AccountServicesHeading mailbox={mailbox} />
        {userHasServices ? (
          <div>
            {mailbox.enabledServiceTypes.map((serviceType) => {
              return this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode)
            })}
            {mailbox.disabledServiceTypes.map((serviceType) => {
              return this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode)
            })}
          </div>
        ) : (
          <div>
            {this.renderServiceType(mailbox, CoreService.SERVICE_TYPES.DEFAULT, onRequestEditCustomCode)}
            <div className={classes.proServices}>
              <h3>Enjoy all these extra services when you purchase Wavebox...</h3>
              <div className={classes.proServiceAvatars}>
                {mailbox.supportedServiceTypes.map((serviceType) => {
                  if (serviceType === CoreService.SERVICE_TYPES.DEFAULT) { return undefined }
                  const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)
                  return (<Avatar key={serviceType} className={classes.serviceAvatar} src={Resolver.image(serviceClass.humanizedLogo)} />)
                })}
              </div>
              <Button variant='raised' color='primary' onClick={this.openWaveboxPro}>
                <Icon className='fas fa-gem' />
                Purchase Wavebox
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default GoogleAccountSettings
