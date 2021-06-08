import React from 'react'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'

export default class AccountMessageDispatcher extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    settingsStore.listen(this.settingsUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    settingsStore.unlisten(this.settingsUpdated)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    const settingsState = settingsStore.getState()
    return {
      accountMessageUrl: userState.user.accountMessageUrl,
      accountMessageUrlSeen: settingsState.app.lastSeenAccountMessageUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      accountMessageUrl: userState.user.accountMessageUrl
    })
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      accountMessageUrlSeen: settingsState.app.lastSeenAccountMessageUrl
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { accountMessageUrl, accountMessageUrlSeen } = this.state

    if (accountMessageUrl && accountMessageUrl !== accountMessageUrlSeen) {
      window.location.hash = '/account/message'
    }

    return false
  }
}
