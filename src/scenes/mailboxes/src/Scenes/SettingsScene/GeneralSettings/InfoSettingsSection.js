import React from 'react'
import { Paper, FlatButton, FontIcon } from 'material-ui'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { updaterActions } from 'stores/updater'
import { settingsActions } from 'stores/settings'
import { userStore } from 'stores/user'
import Release from 'shared/Release'
import pkg from 'package.json'
import {ipcRenderer} from 'electron'
import {
  WB_TAKEOUT_IMPORT,
  WB_TAKEOUT_EXPORT
} from 'shared/ipcEvents'

export default class InfoSettingsSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <Paper zDepth={1} style={styles.paper} {...this.props}>
        <div style={{ fontSize: '85%' }}>
          {Release.generateVersionComponents(pkg, userStore.getState().wireConfigVersion()).map((c) => {
            return (<p key={c}>{c}</p>)
          })}
        </div>
        <FlatButton
          label='Check for Update'
          icon={<FontIcon className='material-icons'>system_update_alt</FontIcon>}
          onClick={() => updaterActions.userCheckForUpdates()} />
        <br />
        <FlatButton
          label='Task Monitor'
          icon={<FontIcon className='material-icons'>timeline</FontIcon>}
          onClick={() => settingsActions.sub.app.openMetricsMonitor()} />
        <br />
        <FlatButton
          label='Export Data'
          icon={<FontIcon className='material-icons'>import_export</FontIcon>}
          onClick={() => ipcRenderer.send(WB_TAKEOUT_EXPORT)} />
        <br />
        <FlatButton
          label='Import Data'
          icon={<FontIcon className='material-icons'>import_export</FontIcon>}
          onClick={() => ipcRenderer.send(WB_TAKEOUT_IMPORT)} />
      </Paper>
    )
  }
}
