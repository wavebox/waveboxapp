import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import WizardColorPicker from './WizardColorPicker'
import WizardServicePicker from './WizardServicePicker'
import { Button, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core'
import { accountActions, accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'
import StyleMixins from 'wbui/Styles/StyleMixins'
import { ACCOUNT_TEMPLATE_TYPES } from 'shared/Models/ACAccounts/AccountTemplates'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ACTemplatedAccount from 'shared/Models/ACAccounts/ACTemplatedAccount'
import WizardPersonaliseGeneric from '../../Common/WizardPersonalise/WizardPersonaliseGeneric'
import WizardPersonaliseContainer from '../../Common/WizardPersonalise/WizardPersonaliseContainer'

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 68,
    padding: 16,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    padding: 16,
    textAlign: 'right'
  },

  // Typography
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  },

  // Elements
  colorPicker: {
    display: 'inline-block',
    maxWidth: '100%'
  },
  servicesPurchaseContainer: {
    border: `2px solid ${lightBlue[500]}`,
    borderRadius: 4,
    padding: 16,
    display: 'block'
  },

  // Footer
  footerCancelButton: {
    marginRight: 8
  }
}

@withStyles(styles)
class WizardPersonalise extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    template: PropTypes.object.isRequired,
    accessMode: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.customPersonalizeRef = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (nextProps.template !== this.props.template || nextProps.accessMode !== this.props.accessMode) {
      const templateColor = this.getDefaultMailboxColor(nextProps.template, nextProps.accessMode)
      this.setState({
        templateColors: [templateColor],
        color: templateColor,
        servicesUILocation: ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START,
        ...this.generateServicesState(nextProps)
      })
    }
  }

  componentDidMount () {
    userStore.listen(this.userUpdated)
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    accountStore.unlisten(this.accountUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const templateColor = this.getDefaultMailboxColor(this.props.template, this.props.accessMode)

    return {
      templateColors: [templateColor],
      color: templateColor,
      servicesUILocation: ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START,
      ...this.generateServicesState(this.props)
    }
  })()

  /**
  * Generates the services config
  * @param props: the props to use
  * @param accountState=autoget: the current state
  * @return the state based on the services
  */
  generateServicesState (props, accountState = accountStore.getState()) {
    const allServices = Array.from(props.template.serviceTypes)
    const restrictedServices = accountState.proposedRestrictedServiceTypes(allServices)
    const restrictedServiceSet = new Set(restrictedServices)
    const unrestrictedServices = allServices.filter((type) => !restrictedServiceSet.has(type))
    const enabledServices = props.template.defaultServiceTypes.filter((type) => !restrictedServiceSet.has(type))

    return {
      hasAdditionalServices: allServices.length > 1,
      restrictedServices: restrictedServices,
      unrestrictedServices: unrestrictedServices,
      enabledServices: enabledServices
    }
  }

  userUpdated = (userState) => {
    this.setState(this.generateServicesState(this.props))
  }

  accountUpdated = (accountState) => {
    this.setState(this.generateServicesState(this.props, accountState))
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user pressing next
  */
  handleNext = () => {
    const { template, accessMode } = this.props
    const { enabledServices, servicesUILocation, color } = this.state

    const account = new ACTemplatedAccount({
      color: color,
      services: enabledServices,
      servicesUILocation: servicesUILocation,
      templateType: template.type,
      displayName: template.displayName,
      accessMode: accessMode
    })

    if (this.customPersonalizeRef) {
      const custom = this.customPersonalizeRef.updateTemplatedAccount(account)
      if (custom.ok) {
        accountActions.authMailboxGroupFromTemplate(custom.account)
      }
    } else {
      accountActions.authMailboxGroupFromTemplate(account)
    }
  }

  /**
  * Opens the pro dialog
  */
  handleOpenPro = () => {
    window.location.hash = '/pro'
  }

  /* **************************************************************************/
  // Data getters
  /* **************************************************************************/

  /**
  * Gets the default color for this mailbox type
  * @param template: the class for the mailbox
  * @param accessMode: the mode that will be used to access the service
  * @return a default colour for this mailbox
  */
  getDefaultMailboxColor (template, accessMode) {
    if (template.type === ACCOUNT_TEMPLATE_TYPES.CONTAINER) {
      // Bad that we don't listen on state here
      const container = userStore.getState().getContainer(accessMode)
      if (container && container.defaultColor) {
        return container.defaultColor
      } else {
        return template.color
      }
    } else {
      return template.color
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param template: the class of mailbox we're creating
  * @param accessMode: the access mode we're using
  * @return jsx or undefined
  */
  renderCustomSection (template, accessMode) {
    if (template.type === ACCOUNT_TEMPLATE_TYPES.CONTAINER) {
      return (
        <WizardPersonaliseContainer
          innerRef={(n) => { this.customPersonalizeRef = n }}
          onRequestNext={this.handleNext}
          accessMode={accessMode} />)
    } else if (template.type === ACCOUNT_TEMPLATE_TYPES.GENERIC) {
      return (
        <WizardPersonaliseGeneric
          innerRef={(n) => { this.customPersonalizeRef = n }}
          onRequestNext={this.handleNext}
          accessMode={accessMode} />)
    } else {
      return undefined
    }
  }

  render () {
    const {
      template,
      accessMode,
      onRequestCancel,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      color,
      templateColors,
      hasAdditionalServices,
      restrictedServices,
      unrestrictedServices,
      enabledServices,
      servicesUILocation
    } = this.state

    return (
      <div {...passProps} className={classNames(classes.container, className)}>
        <div className={classes.body}>
          <div>
            <h2 className={classes.heading}>Pick a Colour</h2>
            <p className={classes.subHeading}>Get started by picking a colour & personalising your account</p>
            <WizardColorPicker
              className={classes.colorPicker}
              colors={templateColors}
              accessMode={accessMode}
              selectedColor={color}
              onColorPicked={(color) => this.setState({ color: color })} />
          </div>
          {hasAdditionalServices ? (
            <div>
              {unrestrictedServices.length ? (
                <div>
                  <h2 className={classes.heading}>Choose your services</h2>
                  <p className={classes.subHeading}>Pick which other services you'd like to use alongside your account</p>
                  <FormControl fullWidth margin='normal'>
                    <InputLabel>How should your services be displayed?</InputLabel>
                    <Select
                      MenuProps={{ disableEnforceFocus: true }}
                      className={classes.displayModePicker}
                      value={servicesUILocation}
                      onChange={(evt) => { this.setState({ servicesUILocation: evt.target.value }) }}>
                      <MenuItem value={ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START}>In a top toolbar (left side)</MenuItem>
                      <MenuItem value={ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END}>In a top toolbar (right side)</MenuItem>
                      <MenuItem value={ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR}>In the sidebar</MenuItem>
                    </Select>
                  </FormControl>
                  <WizardServicePicker
                    services={unrestrictedServices}
                    enabledServices={enabledServices}
                    onServicesChanged={(nextServices) => this.setState({ enabledServices: nextServices })} />
                </div>
              ) : undefined}
              {restrictedServices.length ? (
                <div>
                  <p className={classes.subHeading}>You can use all these services alongside your account when you purchase Wavebox</p>
                  <div className={classes.servicesPurchaseContainer}>
                    <Button color='primary' onClick={this.handleOpenPro}>
                      Purchase Wavebox
                    </Button>
                    <br />
                    <br />
                    <WizardServicePicker
                      services={restrictedServices}
                      disabled
                      enabledServices={[]} />
                  </div>
                </div>
              ) : undefined}
            </div>
          ) : undefined}
          {this.renderCustomSection(template, accessMode)}
        </div>
        <div className={classes.footer}>
          <Button className={classes.footerCancelButton} onClick={onRequestCancel}>
            Cancel
          </Button>
          <Button color='primary' variant='raised' onClick={this.handleNext}>
            Next
          </Button>
        </div>
      </div>
    )
  }
}

export default WizardPersonalise
