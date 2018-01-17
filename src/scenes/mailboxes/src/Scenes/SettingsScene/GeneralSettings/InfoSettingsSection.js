import React from 'react'
import { Paper, FlatButton, FontIcon } from 'material-ui'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { updaterActions } from 'stores/updater'
import { takeoutActions } from 'stores/takeout'
import { settingsActions } from 'stores/settings'
import { userStore } from 'stores/user'
import Release from 'shared/Release'
import pkg from 'package.json'

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
          onClick={() => takeoutActions.exportDataToDisk()} />
        <br />
        <FlatButton
          label='Import Data'
          icon={<FontIcon className='material-icons'>import_export</FontIcon>}
          onClick={this.handleImportData} />
      </Paper>
    )
  }
}
