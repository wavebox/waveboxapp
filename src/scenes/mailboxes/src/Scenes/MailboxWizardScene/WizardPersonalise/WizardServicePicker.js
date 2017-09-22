import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import CoreService from 'shared/Models/Accounts/CoreService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { List, ListItem, Toggle, SelectField, MenuItem } from 'material-ui'

const styles = {
  servicesContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  list: {
    maxWidth: 320,
    paddingTop: 0,
    paddingBottom: 0,
    display: 'inline-block'
  },
  logo: {
    display: 'inline-block',
    height: 40
  },
  logoDisabled: {
    filter: 'grayscale(100%)'
  },
  displayModePicker: {
    minWidth: 450
  }
}

export default class WizardServicePicker extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    MailboxClass: PropTypes.func.isRequired,
    enabledServices: PropTypes.array.isRequired,
    onServicesChanged: PropTypes.func.isRequired,
    servicesDisplayMode: PropTypes.string.isRequired,
    onServicesDisplayModeChanged: PropTypes.func.isRequired,
    userHasServices: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a service being toggled
  * @param serviceType: the type of service that was toggled
  * @param enabled: true if this service is now enabled, false otherwise
  */
  handleToggle = (serviceType, enabled) => {
    const { enabledServices, onServicesChanged } = this.props
    const nextServices = Array.from(enabledServices)
      .filter((s) => s !== serviceType)
      .concat(enabled ? [serviceType] : [])
    onServicesChanged(nextServices)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.props.enabledServices) !== JSON.stringify(nextProps.enabledServices)) { return true }
    return shallowCompare(
      {
        props: { ...this.props, enabledServices: undefined },
        state: this.state
      },
      { ...nextProps, enabledServices: undefined },
      nextState
    )
  }

  /**
  * Renders the service
  * @param serviceType: the service type to render
  * @return jsx
  */
  renderServiceListItem (serviceType) {
    const { MailboxClass, enabledServices, userHasServices } = this.props
    const ServiceClass = ServiceFactory.getClass(MailboxClass.type, serviceType)
    const isEnabled = !!enabledServices.find((s) => s === serviceType)

    return (
      <ListItem
        key={serviceType}
        primaryText={ServiceClass.humanizedType}
        leftAvatar={(
          <img
            src={'../../' + ServiceClass.humanizedLogo}
            style={{
              ...styles.logo,
              ...(!userHasServices ? styles.logoDisabled : {})
            }} />
        )}
        rightToggle={(
          <Toggle
            disabled={!userHasServices}
            toggled={isEnabled}
            onToggle={(evt, toggled) => this.handleToggle(serviceType, toggled)} />
        )} />
    )
  }

  render () {
    const {
      MailboxClass,
      enabledServices,
      onServicesChanged,
      style,
      servicesDisplayMode,
      onServicesDisplayModeChanged,
      userHasServices,
      ...passProps
    } = this.props

    const serviceTypes = MailboxClass.supportedServiceTypes.filter((t) => t !== CoreService.SERVICE_TYPES.DEFAULT)
    const serviceTypeGroups = [
      serviceTypes.slice(0, Math.ceil(serviceTypes.length / 2)),
      serviceTypes.slice(Math.ceil(serviceTypes.length / 2))
    ]

    return (
      <div {...passProps} style={style}>
        <div style={styles.servicesContainer}>
          {serviceTypeGroups.map((serviceGroup, index) => {
            return (
              <List key={'groups_' + index} style={styles.list}>
                {serviceGroup.map((serviceType) => this.renderServiceListItem(serviceType))}
              </List>
            )
          })}
        </div>
        <div>
          <SelectField
            style={styles.displayModePicker}
            floatingLabelText='How should your services be displayed?'
            value={servicesDisplayMode}
            disabled={!userHasServices}
            onChange={(evt, index, mode) => { onServicesDisplayModeChanged(mode) }}>
            <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR} primaryText='In the sidebar' />
            <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR} primaryText='In a top toolbar' />
          </SelectField>
        </div>
      </div>
    )
  }
}
