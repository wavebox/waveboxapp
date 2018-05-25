import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountAppearanceSettingsSection from '../AccountAppearanceSettingsSection'
import AccountAdvancedSettingsSection from '../AccountAdvancedSettingsSection'
import ServicesHeading from '../ServicesHeading'
import AccountServicesSettingsSection from '../AccountServicesSettingsSection'
import AccountDestructiveSettingsSection from '../AccountDestructiveSettingsSection'
import CoreService from 'shared/Models/Accounts/CoreService'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { userStore } from 'stores/user'
import GoogleDefaultServiceSettings from './GoogleDefaultServiceSettings'
import GoogleServiceSettings from './GoogleServiceSettings'
import { mailboxActions, GoogleMailboxReducer } from 'stores/mailbox'
import Resolver from 'Runtime/Resolver'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import { withStyles } from '@material-ui/core/styles'
import { Button, Avatar } from '@material-ui/core'
import AccountSettingsScroller from '../AccountSettingsScroller'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import BuildIcon from '@material-ui/icons/Build'
import TuneIcon from '@material-ui/icons/Tune'
import ListIcon from '@material-ui/icons/List'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasGem from '@fortawesome/fontawesome-pro-solid/faGem'

const styles = {
  proServices: {
    textAlign: 'center'
  },
  proServiceAvatars: {
    marginTop: 8,
    marginBottom: 8
  },
  proServiceAvatar: {
    display: 'inline-block',
    width: 40,
    height: 40,
    backgroundColor: 'white',
    margin: 4,
    border: '2px solid rgb(139, 139, 139)'
  },
  scrollspyServiceAvatar: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    border: '2px solid rgb(139, 139, 139)'
  },
  proButtonIcon: {
    marginRight: 8
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
    this.renderBelowFoldTO = setTimeout(() => {
      this.setState({ renderBelowFold: true })
    }, 500)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    clearTimeout(this.renderBelowFoldTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      userHasServices: userStore.getState().user.hasServices,
      renderBelowFold: false
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
  * @param render: true to render
  * @return jsx
  */
  renderServiceType (mailbox, serviceType, onRequestEditCustomCode, render) {
    switch (serviceType) {
      case CoreService.SERVICE_TYPES.DEFAULT:
        return (
          <section id={`sec-${mailbox.id}-${serviceType}-a-service`} key={serviceType}>
            {render ? (
              <GoogleDefaultServiceSettings
                mailbox={mailbox}
                onRequestEditCustomCode={onRequestEditCustomCode} />
            ) : undefined}
          </section>
        )
      default:
        return (
          <section id={`sec-${mailbox.id}-${serviceType}-a-service`} key={serviceType}>
            {render ? (
              <GoogleServiceSettings
                mailbox={mailbox}
                serviceType={serviceType}
                onRequestEditCustomCode={onRequestEditCustomCode} />
            ) : undefined}
          </section>
        )
    }
  }

  /**
  * Renders the scrollspy content for a service
  * @param serviceType: the service type
  * @return the name
  */
  renderServiceScrollspy (mailbox, serviceType) {
    const service = mailbox.serviceForType(serviceType)
    const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)
    return {
      name: (service || serviceClass).humanizedType,
      icon: (
        <Avatar
          className={this.props.classes.scrollspyServiceAvatar}
          src={Resolver.image(service ? service.humanizedLogoAtSize(128) : serviceClass.humanizedLogo)} />
      )
    }
  }

  render () {
    const { classes, mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const { userHasServices, renderBelowFold } = this.state

    return (
      <AccountSettingsScroller
        scrollspyItems={[
          { id: `sec-${mailbox.id}-appearance`, name: 'Appearance', IconClass: ViewQuiltIcon },
          { id: `sec-${mailbox.id}-services`, name: 'Services', IconClass: ListIcon },
          { id: `sec-${mailbox.id}-advanced`, name: 'Advanced', IconClass: TuneIcon },
          { id: `sec-${mailbox.id}-destructive`, name: 'Tools', IconClass: BuildIcon }
        ].concat(
          [].concat(mailbox.enabledServiceTypes, mailbox.disabledServiceTypes).map((serviceType) => {
            return {
              id: `sec-${mailbox.id}-${serviceType}-a-service`,
              ...this.renderServiceScrollspy(mailbox, serviceType)
            }
          })
        )}
        {...passProps}>
        <AccountAppearanceSettingsSection
          id={`sec-${mailbox.id}-appearance`}
          mailbox={mailbox} />
        <AccountServicesSettingsSection
          id={`sec-${mailbox.id}-services`}
          mailbox={mailbox} />
        <AccountAdvancedSettingsSection
          id={`sec-${mailbox.id}-advanced`}
          mailbox={mailbox}
          showRestart={showRestart}
          windowOpenAfter={(
            <SettingsListItemSwitch
              divider={false}
              label='Open Google Drive links with browser'
              onChange={(evt, toggled) => {
                mailboxActions.reduce(mailbox.id, GoogleMailboxReducer.setOpenDriveLinksWithExternalBrowser, toggled)
              }}
              checked={mailbox.openDriveLinksWithExternalBrowser} />
          )}
        />
        <AccountDestructiveSettingsSection
          id={`sec-${mailbox.id}-destructive`}
          mailbox={mailbox} />
        <ServicesHeading mailbox={mailbox} />
        {userHasServices ? (
          [].concat(
            mailbox.enabledServiceTypes,
            mailbox.disabledServiceTypes
          ).map((serviceType) => this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode, renderBelowFold))
        ) : (
          <div>
            {this.renderServiceType(mailbox, CoreService.SERVICE_TYPES.DEFAULT, onRequestEditCustomCode, renderBelowFold)}
            <div className={classes.proServices}>
              <h3>Enjoy all these extra services when you purchase Wavebox...</h3>
              <div className={classes.proServiceAvatars}>
                {mailbox.supportedServiceTypes.map((serviceType) => {
                  if (serviceType === CoreService.SERVICE_TYPES.DEFAULT) { return undefined }
                  const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)
                  return (<Avatar key={serviceType} className={classes.proServiceAvatar} src={Resolver.image(serviceClass.humanizedLogo)} />)
                })}
              </div>
              <Button variant='raised' color='primary' onClick={this.openWaveboxPro}>
                <FontAwesomeIcon icon={fasGem} className={classes.proButtonIcon} />
                Purchase Wavebox
              </Button>
            </div>
          </div>
        )}
      </AccountSettingsScroller>
    )
  }
}

export default GoogleAccountSettings
