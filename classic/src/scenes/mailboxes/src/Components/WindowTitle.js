import React from 'react'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'

const TITLE_WRITE_WAIT = 200

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
    this.writeTimeout = null
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
    clearTimeout(this.writeTimeout)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  accountChanged = (accountState) => {
    const activeServiceId = accountState.activeServiceId()
    const activeServiceData = accountState.activeServiceData()
    this.setState({
      unreadCount: accountState.userUnreadCountForApp(),
      activeServiceName: accountState.resolvedServiceDisplayName(activeServiceId),
      activeGuestTitle: activeServiceData ? activeServiceData.documentTitle : undefined
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      showTitlebarCount: settingsState.ui.showTitlebarCount,
      showTitlebarAccount: settingsState.ui.showTitlebarAccount
    })
  }

  state = (() => {
    const settingsState = settingsStore.getState()
    const accountState = accountStore.getState()

    const activeServiceId = accountState.activeServiceId()
    const activeServiceData = accountState.activeServiceData()

    return {
      showTitlebarCount: settingsState.ui.showTitlebarCount,
      showTitlebarAccount: settingsState.ui.showTitlebarAccount,
      unreadCount: accountState.userUnreadCountForApp(),
      activeGuestTitle: activeServiceData ? activeServiceData.documentTitle : undefined,
      activeServiceName: accountState.resolvedServiceDisplayName(activeServiceId)
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      showTitlebarCount,
      showTitlebarAccount,
      unreadCount,
      activeGuestTitle,
      activeServiceName
    } = this.state

    const activeAcc1 = showTitlebarAccount && activeServiceName ? activeServiceName : undefined
    const activeAcc2 = showTitlebarAccount && activeGuestTitle ? activeGuestTitle : undefined

    const titleComponents = [
      showTitlebarCount && unreadCount !== 0 ? `Wavebox (${unreadCount})` : 'Wavebox',
      activeAcc1,
      activeAcc1 !== activeAcc2 ? activeAcc2 : undefined
    ]

    const title = titleComponents.filter((c) => !!c).join(' | ')

    // By throttling the writes we can prevent flashing when the page rapidly changes the title
    clearTimeout(this.writeTimeout)
    this.writeTimeout = setTimeout(() => {
      if (title !== document.title) {
        document.title = title
      }
    }, TITLE_WRITE_WAIT)

    return null
  }
}
