import React from 'react'
import {Paper} from 'material-ui'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import { updaterActions } from 'stores/updater'
import { WB_OPEN_MONITOR_WINDOW } from 'shared/ipcEvents'
const { ipcRenderer } = window.nativeRequire('electron')
const pkg = window.appPackage()

export default class InfoSettingsSection extends React.Component {
  /* **************************************************************************/
  // UI Event
  /* **************************************************************************/

  /**
  * Shows a snapshot of the current memory consumed
  */
  handleShowMemoryInfo = (evt) => {
    evt.preventDefault()
    ipcRenderer.send(WB_OPEN_MONITOR_WINDOW, {})
  }

  /**
  * Starts the check for update flow
  */
  handleCheckForUpdate = (evt) => {
    evt.preventDefault()
    updaterActions.userCheckForUpdates()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <Paper zDepth={1} style={styles.paper} {...this.props}>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={this.handleShowMemoryInfo}
          href='#'>
          Task Monitor
        </a>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={this.handleCheckForUpdate}
          href='#'>
          Check for Update
        </a>
        <div style={{ fontSize: '85%' }}>
          <p>{`Wavebox ${pkg.version}`}</p>
          {pkg.earlyBuildId ? (
            <p>{`Early Build Reference: ${pkg.earlyBuildId}`}</p>
          ) : undefined}
        </div>
      </Paper>
    )
  }
}
