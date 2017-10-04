import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import CoreService from 'shared/Models/Accounts/CoreService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import ServiceFactory from 'shared/Models/Accounts/ServiceFactory'
import { List, ListItem, Toggle, SelectField, MenuItem } from 'material-ui'
import { Row, Col } from 'Components/Grid'

const SERVICE_GROUPS = {
  common: [
    CoreMailbox.SERVICE_TYPES.CALENDAR,
    CoreMailbox.SERVICE_TYPES.COMMUNICATION,
    CoreMailbox.SERVICE_TYPES.CONTACTS,
    CoreMailbox.SERVICE_TYPES.NOTES,
    CoreMailbox.SERVICE_TYPES.PHOTOS
  ],
  office: [
    CoreMailbox.SERVICE_TYPES.STORAGE,
    CoreMailbox.SERVICE_TYPES.DOCS,
    CoreMailbox.SERVICE_TYPES.SHEETS,
    CoreMailbox.SERVICE_TYPES.SLIDES
  ]
}
const SERVICE_ORDERING = [
  CoreMailbox.SERVICE_TYPES.DEFAULT,
  CoreMailbox.SERVICE_TYPES.CALENDAR,
  CoreMailbox.SERVICE_TYPES.COMMUNICATION,
  CoreMailbox.SERVICE_TYPES.CONTACTS,
  CoreMailbox.SERVICE_TYPES.NOTES,
  CoreMailbox.SERVICE_TYPES.PHOTOS,
  CoreMailbox.SERVICE_TYPES.STORAGE,
  CoreMailbox.SERVICE_TYPES.DOCS,
  CoreMailbox.SERVICE_TYPES.SHEETS,
  CoreMailbox.SERVICE_TYPES.SLIDES,
  CoreMailbox.SERVICE_TYPES.ANALYTICS,
  CoreMailbox.SERVICE_TYPES.VIDEO,
  CoreMailbox.SERVICE_TYPES.SOCIAL,
  CoreMailbox.SERVICE_TYPES.MESSENGER
]

const styles = {
  list: {
    width: 280,
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

  /**
  * Splits the services into known groups
  * @param serviceTypes: the service types
  * @return { common, office, misc }
  */
  splitServicesIntoKnownGroups (serviceTypes) {
    const services = new Set(serviceTypes)
    const common = SERVICE_GROUPS.common.reduce((acc, type) => {
      if (services.has(type)) {
        services.delete(type)
        return acc.concat(type)
      } else {
        return acc
      }
    }, [])
    const office = SERVICE_GROUPS.office.reduce((acc, type) => {
      if (services.has(type)) {
        services.delete(type)
        return acc.concat(type)
      } else {
        return acc
      }
    }, [])
    const misc = Array.from(services)

    return { common, office, misc }
  }

  /**
  * Renders the service group lists
  * @param MailboxClass: the class of mailbox to get the supported services from
  * @return an array with up to 3 service groups
  */
  createServiceGroupLists (MailboxClass) {
    const serviceTypes = MailboxClass.supportedServiceTypes.filter((t) => t !== CoreService.SERVICE_TYPES.DEFAULT)
    const { common, office, misc } = this.splitServicesIntoKnownGroups(serviceTypes)
    if (common.length <= 1 || office.length <= 1) {
      const services = new Set(serviceTypes)
      const orderedServices = SERVICE_ORDERING.reduce((acc, type) => {
        if (services.has(type)) {
          return acc.concat(type)
        } else {
          return acc
        }
      }, [])
      const third = Math.ceil(orderedServices.length / 3)
      return [
        orderedServices.slice(0, third * 1),
        orderedServices.slice(third * 1, third * 2),
        orderedServices.slice(third * 2)
      ]
    } else {
      return [ common, office, misc ]
    }
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

    const serviceTypeGroups = this.createServiceGroupLists(MailboxClass)

    return (
      <div {...passProps} style={style}>
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
        <Row>
          <Col md={8}>
            <Row>
              <Col sm={6}>
                <List style={styles.list}>
                  {serviceTypeGroups[0].map((serviceType) => this.renderServiceListItem(serviceType))}
                </List>
              </Col>
              <Col sm={6}>
                <List style={styles.list}>
                  {serviceTypeGroups[1].map((serviceType) => this.renderServiceListItem(serviceType))}
                </List>
              </Col>
            </Row>
          </Col>
          <Col md={4}>
            <List style={styles.list}>
              {serviceTypeGroups[2].map((serviceType) => this.renderServiceListItem(serviceType))}
            </List>
          </Col>
        </Row>
      </div>
    )
  }
}
