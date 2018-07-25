import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import { updaterActions } from 'stores/updater'
import AppSettings from 'shared/Models/Settings/AppSettings'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate'
import { withStyles } from '@material-ui/core/styles'

const styles = {

}

@withStyles(styles)
class UpdateSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.app, nextProps.app, ['checkForUpdates', 'updateChannel']) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
  }

  render () {
    const { showRestart, app, classes, ...passProps } = this.props

    return (
      <SettingsListSection title='Updates' icon={<SystemUpdateIcon />} {...passProps}>
        <SettingsListItemSwitch
          label='Check for updates'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.checkForUpdates(toggled)
          }}
          checked={app.checkForUpdates} />
        <SettingsListItemSelectInline
          label='Update channel'
          value={app.updateChannel}
          options={[
            { value: AppSettings.UPDATE_CHANNELS.STABLE, label: 'Stable' },
            { value: AppSettings.UPDATE_CHANNELS.BETA, label: 'Beta' }
          ]}
          onChange={(evt, value) => {
            settingsActions.sub.app.setUpdateChannel(value)
            updaterActions.checkForUpdates()
          }} />
        <SettingsListItemButton
          divider={false}
          label='Check for update now'
          icon={<SystemUpdateIcon />}
          onClick={() => { updaterActions.userCheckForUpdates() }} />
      </SettingsListSection>
    )
  }
}

export default UpdateSettingsSection
