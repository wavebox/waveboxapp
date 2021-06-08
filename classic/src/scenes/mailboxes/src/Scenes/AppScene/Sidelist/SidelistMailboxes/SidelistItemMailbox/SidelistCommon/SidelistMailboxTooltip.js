import PropTypes from 'prop-types'
import React from 'react'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'

import MailboxTooltip from 'Components/MailboxTooltip'
import UISettings from 'shared/Models/Settings/UISettings'

class SidelistMailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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
      simpleMode: !settingsState.ui.accountTooltipInteractive
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY,
      simpleMode: !settingsState.ui.accountTooltipInteractive
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
      mailboxId,
      children,
      ...passProps
    } = this.props
    const { tooltipsEnabled, simpleMode } = this.state

    return (
      <MailboxTooltip
        mailboxId={mailboxId}
        simpleMode={simpleMode}
        disabled={!tooltipsEnabled}
        placement='right'
        {...passProps}>
        {children}
      </MailboxTooltip>
    )
  }
}

export default SidelistMailboxTooltip
