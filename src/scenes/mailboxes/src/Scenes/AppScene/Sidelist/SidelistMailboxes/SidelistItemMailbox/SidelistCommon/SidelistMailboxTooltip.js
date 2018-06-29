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
      tooltipsEnabled: settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED || settingsState.ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY
    }
  })()

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
    const { mailboxId, ...passProps } = this.props
    const { tooltipsEnabled } = this.state
    if (!tooltipsEnabled) { return false }

    return (
      <MailboxTooltip
        mailboxId={mailboxId}
        tooltipTimeout={0}
        position='right'
        arrow='center'
        {...passProps} />
    )
  }
}

export default SidelistMailboxTooltip
