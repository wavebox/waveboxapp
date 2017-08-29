import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { FlatButton, SelectField, MenuItem } from 'material-ui'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import CoreService from 'shared/Models/Accounts/CoreService'
import { SleepableField } from 'Components/Fields'
import * as Colors from 'material-ui/styles/colors'

const humanizedOpenModes = {
  [CoreService.DEFAULT_WINDOW_OPEN_MODES.BROWSER]: 'Default Browser',
  [CoreService.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX]: 'Wavebox Browser'
}
const styles = {
  sleepUnavailable: {
    border: `2px solid ${Colors.lightBlue500}`,
    borderRadius: 4,
    padding: 16,
    marginTop: 8,
    marginBottom: 8
  },
  sleepUnavailableText: {
    color: Colors.lightBlue500,
    fontWeight: '300',
    marginTop: 0
  }
}

export default class AccountBehaviourSettings extends React.Component {
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
    const { mailbox, service, ...passProps } = this.props
    const { userHasSleepable } = this.state

    return (
      <div {...passProps}>
        <SelectField
          floatingLabelText='Open new windows in which Browser'
          value={service.defaultWindowOpenMode}
          floatingLabelFixed
          fullWidth
          onChange={(evt, index, value) => {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setDefaultWindowOpenMode, value)
          }}>
          {Object.keys(CoreService.DEFAULT_WINDOW_OPEN_MODES).map((mode) => {
            return (<MenuItem key={mode} value={mode} primaryText={humanizedOpenModes[mode]} />)
          })}
        </SelectField>
        {userHasSleepable ? (
          <SleepableField
            key={`${mailbox.id}:${service.type}`}
            sleepEnabled={service.sleepable}
            onSleepEnabledChanged={(toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepable, toggled)
            }}
            sleepWaitMs={service.sleepableTimeout}
            onSleepWaitMsChanged={(value) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepableTimeout, value)
            }} />
        ) : (
          <div style={styles.sleepUnavailable}>
            <SleepableField
              key={`${mailbox.id}:${service.type}`}
              disabled
              sleepEnabled={service.sleepable}
              onSleepEnabledChanged={(toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepable, toggled)
              }}
              sleepWaitMs={service.sleepableTimeout}
              onSleepWaitMsChanged={(value) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepableTimeout, value)
              }} />
            <p style={styles.sleepUnavailableText}>
              Services and accounts can sleep when in the background to save memory.
              Enable service sleeping by purchasing Wavebox
            </p>
            <FlatButton
              primary
              label='Purchase Wavebox'
              onClick={() => { window.location.hash = '/pro' }} />
          </div>
        )}
      </div>
    )
  }
}
