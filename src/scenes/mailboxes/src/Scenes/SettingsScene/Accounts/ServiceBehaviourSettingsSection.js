import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import SleepableField from 'wbui/SleepableField'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import HotelIcon from '@material-ui/icons/Hotel'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

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
class ServiceBehaviourSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired
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
      userHasSleepable: userStore.getState().user.hasSleepable
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.mailbox, nextProps.mailbox, ['id']) ||
      modelCompare(this.props.service, nextProps.service, ['type', 'sleepable', 'sleepableTimeout']) ||
      partialShallowCompare({}, this.state, {}, nextState)
    )
  }

  render () {
    const { mailbox, service, classes, ...passProps } = this.props
    const { userHasSleepable } = this.state

    return (
      <SettingsListSection title='Sleep & Behaviour' icon={<HotelIcon />} {...passProps}>
        <SettingsListItem divider={false}>
          <SleepableField
            key={`${mailbox.id}:${service.type}`}
            disabled={!userHasSleepable}
            fullWidth
            sleepEnabled={service.sleepable}
            onSleepEnabledChanged={(toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepable, toggled)
            }}
            sleepWaitMs={service.sleepableTimeout}
            onSleepWaitMsChanged={(value) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepableTimeout, value)
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

export default ServiceBehaviourSettingsSection
