import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { Toggle, Paper, RaisedButton, FontIcon } from 'material-ui'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class DownloadSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  }

  componentDidUpdate () {
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {os, ...passProps} = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Downloads</h1>
        <Toggle
          toggled={os.alwaysAskDownloadLocation}
          label='Always ask download location'
          labelPosition='right'
          onToggle={(evt, toggled) => settingsActions.setAlwaysAskDownloadLocation(toggled)} />
        <div style={Object.assign({}, styles.button, { display: 'flex', alignItems: 'center' })}>
          <RaisedButton
            label='Select location'
            icon={<FontIcon className='material-icons'>folder</FontIcon>}
            containerElement='label'
            disabled={os.alwaysAskDownloadLocation}
            style={styles.fileInputButton}>
            <input
              type='file'
              style={styles.fileInput}
              ref='defaultDownloadInput'
              disabled={os.alwaysAskDownloadLocation}
              onChange={(evt) => settingsActions.setDefaultDownloadLocation(evt.target.files[0].path)} />
          </RaisedButton>
          {os.alwaysAskDownloadLocation ? undefined : <small>{os.defaultDownloadLocation}</small>}
        </div>
        <Toggle
          toggled={os.downloadNotificationEnabled}
          label='Show notification when download completes'
          labelPosition='right'
          onToggle={(evt, toggled) => settingsActions.setDownloadNotificationEnabled(toggled)} />
        <Toggle
          toggled={os.downloadNotificationSoundEnabled}
          disabled={!os.downloadNotificationEnabled}
          label='Play sound when download completes'
          labelPosition='right'
          onToggle={(evt, toggled) => settingsActions.setDownloadNotificationSoundEnabled(toggled)} />
      </Paper>
    )
  }
}
