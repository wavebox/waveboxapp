import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Toggle, TextField, RaisedButton, FontIcon } from 'material-ui'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'

export default class AccountSleepableSettings extends React.Component {
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
        <Toggle
          disabled={!userHasSleepable}
          toggled={service.sleepable}
          label='Sleep tab when not in use'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepable, toggled)
          }} />
        <TextField
          key={`${mailbox.id}:${service.type}:${service.sleepableTimeout}`}
          hintText='30'
          floatingLabelText='Seconds to wait before sleeping'
          floatingLabelFixed
          disabled={!service.sleepable || !userHasSleepable}
          defaultValue={service.sleepableTimeout / 1000}
          type='number'
          min='1'
          step='1'
          max='6000'
          onBlur={(evt) => {
            const value = parseInt(evt.target.value) * 1000
            mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepableTimeout, value)
          }}
        />
        {!userHasSleepable ? (
          <div>
            <p>
              Services and accounts can sleep when in the background to save memory.
              Enable service sleeping with Wavebox Pro
            </p>
            <div>
              <RaisedButton
                primary
                icon={(<FontIcon className='fa fa-diamond' />)}
                label='Wavebox Pro'
                onClick={() => { window.location.hash = '/pro' }} />
            </div>
          </div>
        ) : undefined}
      </div>
    )
  }
}
