import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Button, ListItemText, ListItemSecondaryAction } from 'material-ui'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import SleepableField from 'wbui/SleepableField'
import { withStyles } from 'material-ui/styles'
import lightBlue from 'material-ui/colors/lightBlue'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'

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
    marginTop: 0
  }
}

@withStyles(styles)
class AccountBehaviourSettings extends React.Component {
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
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, service, classes, ...passProps } = this.props
    const { userHasSleepable } = this.state

    return (
      <SettingsListSection title='Sleep & Behaviour' {...passProps}>
        <SettingsListItem>
          <SleepableField
            key={`${mailbox.id}:${service.type}`}
            disabled={!userHasSleepable}
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
          <SettingsListItem>
            <ListItemText primary={(
              <span className={classes.sleepUnavailableText}>
                Services and accounts can sleep when in the background to save memory.
                Enable service sleeping by purchasing Wavebox
              </span>
            )} />
            <ListItemSecondaryAction>
              <Button variant='raised' color='primary' onClick={() => { window.location.hash = '/pro' }}>
                Purchase Wavebox
              </Button>
            </ListItemSecondaryAction>
          </SettingsListItem>
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default AccountBehaviourSettings
