import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, FlatButton, FontIcon } from 'material-ui'
import { settingsActions } from 'stores/settings'
import { updaterActions } from 'stores/updater'
import AppSettings from 'shared/Models/Settings/AppSettings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class UpdateSettingsSection extends React.Component {
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
    const { showRestart, app, style, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={{...styles.paper, ...style}} {...passProps}>
        <h1 style={styles.subheading}>Updates</h1>
        <div>
          <FlatButton
            label='Check for update now'
            icon={<FontIcon className='material-icons'>system_update_alt</FontIcon>}
            onClick={() => updaterActions.userCheckForUpdates()} />
        </div>
        <br />
        <div>
          <Toggle
            toggled={app.checkForUpdates}
            label='Check for updates'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.sub.app.checkForUpdates(toggled)
            }} />
        </div>
        <SelectField
          fullWidth
          floatingLabelText='Update channel'
          value={app.updateChannel}
          onChange={(evt, index, channel) => {
            settingsActions.sub.app.setUpdateChannel(channel)
            updaterActions.checkForUpdates()
          }}>
          {Object.keys(AppSettings.UPDATE_CHANNELS).map((channel) => {
            if (channel === AppSettings.UPDATE_CHANNELS.STABLE) {
              return (<MenuItem key={channel} value={channel} primaryText='Stable' />)
            } else if (channel === AppSettings.UPDATE_CHANNELS.BETA) {
              return (<MenuItem key={channel} value={channel} primaryText='Beta' />)
            }
          })}
        </SelectField>
      </Paper>
    )
  }
}
