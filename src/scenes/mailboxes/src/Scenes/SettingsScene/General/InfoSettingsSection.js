import React from 'react'
import {Paper} from 'material-ui'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
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
    ipcRenderer.send('monitor-window', {})
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
        <div style={{ fontSize: '85%' }}>
          <p>
            {`Wavebox ${pkg.version}`}
          </p>
          <p style={{color: Colors.grey400}}>
            {`Electron/${process.versions.electron} Chromium/${process.versions.chrome}`}
          </p>
        </div>
      </Paper>
    )
  }
}
