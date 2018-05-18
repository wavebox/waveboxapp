import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import FolderIcon from '@material-ui/icons/Folder'
import { Button, ListItemText, ListItemSecondaryAction, Switch } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'

const styles = {
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18
  },
  fileInputButton: {
    marginRight: 15,
    position: 'relative',
    overflow: 'hidden'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: '100%',
    cursor: 'pointer'
  },
  downloadLocation: {
    fontSize: '11px',
    color: grey[700]
  },
  downloadLocationItem: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  }
}

@withStyles(styles)
class DownloadSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {os, classes, ...passProps} = this.props

    return (
      <SettingsListSection title='Downloads' {...passProps}>
        <SettingsListItem className={classes.downloadLocationItem}>
          <ListItemText primary='Always ask download location' />
          <div>
            <Button
              size='small'
              className={classes.fileInputButton}
              disabled={!os.alwaysAskDownloadLocation}>
              <FolderIcon className={classes.buttonIcon} />
              Select location
              <input
                type='file'
                className={classes.fileInput}
                webkitdirectory='webkitdirectory'
                disabled={os.alwaysAskDownloadLocation}
                onChange={(evt) => settingsActions.sub.os.setDefaultDownloadLocation(evt.target.files[0].path)} />
            </Button>
            {!os.alwaysAskDownloadLocation ? undefined : <span className={classes.downloadLocation}>{os.defaultDownloadLocation}</span>}
          </div>
          <ListItemSecondaryAction>
            <Switch
              color='primary'
              onChange={(evt, toggled) => settingsActions.sub.os.setAlwaysAskDownloadLocation(toggled)}
              checked={os.alwaysAskDownloadLocation} />
          </ListItemSecondaryAction>
        </SettingsListItem>
        <SettingsListSwitch
          label='Show notification when download completes'
          onChange={(evt, toggled) => settingsActions.sub.os.setDownloadNotificationEnabled(toggled)}
          checked={os.downloadNotificationEnabled} />
        <SettingsListSwitch
          divider={false}
          disabled={!os.downloadNotificationEnabled}
          label='Play sound when download completes'
          onChange={(evt, toggled) => settingsActions.sub.os.setDownloadNotificationSoundEnabled(toggled)}
          checked={os.downloadNotificationSoundEnabled} />
      </SettingsListSection>
    )
  }
}

export default DownloadSettingsSection
