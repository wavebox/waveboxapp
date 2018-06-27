import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { List, ListItem, ListItemText, ListItemSecondaryAction, Switch, Grid } from '@material-ui/core'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  list: {
    marginLeft: -15,
    marginRight: -15,
    paddingTop: 0,
    paddingBottom: 0,
    display: 'inline-block',
    width: '100%'
  },
  logo: {
    display: 'inline-block',
    height: 32,
    marginTop: 4
  },
  logoDisabled: {
    filter: 'grayscale(100%)'
  },
  displayModePicker: {
    minWidth: 450
  }
}

@withStyles(styles)
class WizardServicePicker extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    services: PropTypes.array.isRequired,
    enabledServices: PropTypes.array.isRequired,
    onServicesChanged: PropTypes.func,
    disabled: PropTypes.bool.isRequired
  }

  static defaultProps = {
    disabled: false
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
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the service
  * @param classes
  * @param serviceType: the service type to render
  * @return jsx
  */
  renderServiceListItem (classes, serviceType) {
    const { enabledServices, disabled } = this.props
    //const ServiceClass = ServiceFactory.getClass(MailboxClass.type, serviceType)
    const isEnabled = !!enabledServices.find((s) => s === serviceType)

    return (
      <ListItem key={serviceType} dense>
        {/*<img
          src={Resolver.image(ServiceClass.humanizedLogoAtSize(128))}
          className={classNames(classes.logo, !userHasServices ? styles.logoDisabled : undefined)} />*/}
        {/*<ListItemText primary={ServiceClass.humanizedType} />*/}
        <ListItemText primary={serviceType} />
        <ListItemSecondaryAction>
          <Switch
            disabled={disabled}
            color='primary'
            checked={isEnabled}
            onChange={(evt, toggled) => this.handleToggle(serviceType, toggled)} />
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  /**
  * Renders the service group lists
  * @param MailboxClass: the class of mailbox to get the supported services from
  * @return an array with up to 3 service groups
  */
  chunkServices (services) {
    const chunks = [[], [], []]

    for (let i = 0; i < services.length; i += 3) {
      if (services[i]) { chunks[0].push(services[i]) }
      if (services[i + 1]) { chunks[1].push(services[i + 1]) }
      if (services[i + 2]) { chunks[2].push(services[i + 2]) }
    }

    return chunks
  }

  render () {
    const {
      services,
      enabledServices,
      onServicesChanged,
      disabled,
      classes,
      ...passProps
    } = this.props

    const serviceTypeGroups = this.chunkServices(services)

    return (
      <div {...passProps}>
        <Grid container spacing={8}>
          <Grid item md>
            <List className={classes.list}>
              {serviceTypeGroups[0].map((serviceType) => this.renderServiceListItem(classes, serviceType))}
            </List>
          </Grid>
          <Grid item md>
            <List className={classes.list}>
              {serviceTypeGroups[1].map((serviceType) => this.renderServiceListItem(classes, serviceType))}
            </List>
          </Grid>
          <Grid item md>
            <List className={classes.list}>
              {serviceTypeGroups[2].map((serviceType) => this.renderServiceListItem(classes, serviceType))}
            </List>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default WizardServicePicker
