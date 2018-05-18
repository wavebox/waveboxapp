import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'material-ui'
import { settingsActions } from 'stores/settings'
import { updaterActions } from 'stores/updater'
import AppSettings from 'shared/Models/Settings/AppSettings'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListSelect from 'wbui/SettingsListSelect'
import SettingsListItem from 'wbui/SettingsListItem'
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt'
import { withStyles } from 'material-ui/styles'

const styles = {
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18
  }
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
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, app, classes, ...passProps } = this.props

    return (
      <SettingsListSection title='Updates' {...passProps}>
        <SettingsListSwitch
          label='Check for updates'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.checkForUpdates(toggled)
          }}
          checked={app.checkForUpdates} />
        <SettingsListSelect
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
        <SettingsListItem divider={false}>
          <Button variant='raised' size='small' onClick={() => updaterActions.userCheckForUpdates()}>
            <SystemUpdateAltIcon className={classes.buttonIcon} />
            Check for update now
          </Button>
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}

export default UpdateSettingsSection
