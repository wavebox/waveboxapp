import PropTypes from 'prop-types'
import React from 'react'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'

import ServiceTooltip from 'Components/ServiceTooltip'
import UISettings from 'shared/Models/Settings/UISettings'

class SidelistServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()

    return {
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY,
      tooltipSimpleMode: !settingsState.ui.accountTooltipInteractive
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY,
      tooltipSimpleMode: !settingsState.ui.accountTooltipInteractive
    })
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
      mailboxId,
      children,
      ...passProps
    } = this.props
    const { tooltipsEnabled, tooltipSimpleMode } = this.state

    return (
      <ServiceTooltip
        mailboxId={mailboxId}
        serviceId={serviceId}
        disabled={!tooltipsEnabled}
        simpleMode={tooltipSimpleMode}
        placement='right'
        {...passProps}>
        {children}
      </ServiceTooltip>
    )
  }
}

export default SidelistServiceTooltip
