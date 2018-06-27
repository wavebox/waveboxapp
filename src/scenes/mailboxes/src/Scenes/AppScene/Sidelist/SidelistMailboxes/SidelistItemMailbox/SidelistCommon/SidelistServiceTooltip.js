import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'

import MailboxServiceTooltip from 'wbui/MailboxServiceTooltip'
import UISettings from 'shared/Models/Settings/UISettings'

class SidelistServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState({
        service: accountState.getService(nextProps.serviceId),
        mailbox: accountState.getMailboxForService(nextProps.serviceId),
        isRestricted: accountState.isServiceRestricted(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const accountState = accountStore.getState()

    return {
      service: accountState.getService(this.props.serviceId),
      mailbox: accountState.getMailboxForService(this.props.serviceId),
      isRestricted: accountState.isServiceRestricted(this.props.serviceId),
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      service: accountState.getService(this.props.serviceId),
      mailbox: accountState.getMailboxForService(this.props.serviceId),
      isRestricted: accountState.isServiceRestricted(this.props.serviceId)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceId, ...passProps } = this.props
    const { service, mailbox, isRestricted, tooltipsEnabled } = this.state
    if (!tooltipsEnabled) { return false }

    return (
      <MailboxServiceTooltip
        mailbox={mailbox}
        service={service}
        isRestricted={isRestricted}
        tooltipTimeout={0}
        position='right'
        arrow='center'
        {...passProps} />
    )
  }
}

export default SidelistServiceTooltip
