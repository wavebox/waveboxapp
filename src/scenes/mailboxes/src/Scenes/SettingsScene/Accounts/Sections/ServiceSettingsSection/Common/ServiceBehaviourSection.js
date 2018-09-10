import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { userStore } from 'stores/user'
import SleepableField from 'wbui/SleepableField'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import HotelIcon from '@material-ui/icons/Hotel'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'

const styles = {
  sleepUnavailable: {
    border: `2px solid ${lightBlue[500]}`,
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
    marginBottom: 8
  },
  sleepUnavailableText: {
    color: lightBlue[500],
    fontWeight: '300',
    marginTop: 0,
    paddingRight: 100,
    display: 'inline-block'
  }
}

@withStyles(styles)
class ServiceBehaviourSection extends React.Component {
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
        this.extractStateForService(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      userHasSleepable: userStore.getState().user.hasSleepable,
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
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
      sleepable: service.sleepable,
      sleepableTimeout: service.sleepableTimeout
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

  render () {
    const {
      serviceId,
      classes,
      ...passProps
    } = this.props
    const {
      userHasSleepable,
      hasService,
      sleepable,
      sleepableTimeout
    } = this.state
    if (!hasService) { return false }

    return (
      <SettingsListSection title='Sleep & Behaviour' icon={<HotelIcon />} {...passProps}>
        <SettingsListItem divider={false}>
          <SleepableField
            key={serviceId}
            disabled={!userHasSleepable}
            fullWidth
            sleepEnabled={sleepable}
            onSleepEnabledChanged={(toggled) => {
              accountActions.reduceService(serviceId, ServiceReducer.setSleepable, toggled)
            }}
            sleepWaitMs={sleepableTimeout}
            onSleepWaitMsChanged={(value) => {
              accountActions.reduceService(serviceId, ServiceReducer.setSleepableTimeout, value)
            }} />
        </SettingsListItem>
        {!userHasSleepable ? (
          <SettingsListItemButton
            divider={false}
            primary={(
              <span className={classes.sleepUnavailableText}>
                Services and accounts can sleep when in the background to save memory.
                Enable service sleeping by purchasing Wavebox
              </span>
            )}
            label='Purchase Wavebox'
            buttonProps={{ color: 'primary' }}
            onClick={() => { window.location.hash = '/pro' }} />
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default ServiceBehaviourSection
