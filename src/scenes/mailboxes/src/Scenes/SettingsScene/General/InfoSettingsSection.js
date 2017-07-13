import React from 'react'
import { Paper, FlatButton, FontIcon } from 'material-ui'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { updaterActions } from 'stores/updater'
import { takeoutActions } from 'stores/takeout'
import { WB_OPEN_MONITOR_WINDOW } from 'shared/ipcEvents'
import Release from 'shared/Release'

const { ipcRenderer } = window.nativeRequire('electron')
const pkg = window.appPackage()

export default class InfoSettingsSection extends React.Component {
  /* **************************************************************************/
  // UI Event
  /* **************************************************************************/

  /**
  * Starts the data import process
  */
  handleImportData = () => {
    const shouldImport = window.confirm([
      'Importing accounts and settings will remove any configuration you have done on this machine.',
      '',
      'Are you sure you want to do this?'
    ].join('\n'))

    if (shouldImport) {
      takeoutActions.importDataFromDisk()
    }
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
        <div style={{ fontSize: '85%' }}>
          {Release.generateVersionComponents(pkg).map((c) => {
            return (<p key={c}>{c}</p>)
          })}
        </div>
        <FlatButton
          label='Check for Update'
          icon={<FontIcon className='material-icons'>system_update_alt</FontIcon>}
          onTouchTap={() => updaterActions.userCheckForUpdates()} />
        <br />
        <FlatButton
          label='Task Monitor'
          icon={<FontIcon className='material-icons'>timeline</FontIcon>}
          onTouchTap={() => ipcRenderer.send(WB_OPEN_MONITOR_WINDOW, {})} />
        <br />
        <FlatButton
          label='Export Data'
          icon={<FontIcon className='material-icons'>import_export</FontIcon>}
          onTouchTap={() => takeoutActions.exportDataToDisk()} />
        <br />
        <FlatButton
          label='Import Data'
          icon={<FontIcon className='material-icons'>import_export</FontIcon>}
          onTouchTap={this.handleImportData} />
      </Paper>
    )
  }
}
