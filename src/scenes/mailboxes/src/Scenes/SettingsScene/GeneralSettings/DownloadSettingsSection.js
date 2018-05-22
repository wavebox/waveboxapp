import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import FolderIcon from '@material-ui/icons/Folder'
import { ListItemText, ListItemSecondaryAction, Switch } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import FileUploadButton from 'wbui/FileUploadButton'

const styles = {
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18
  },
  downloadLocation: {
    marginLeft: 12,
    display: 'inline-block',
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
      <SettingsListSection title='Downloads' icon={<CloudDownloadIcon />} {...passProps}>
        <SettingsListItem className={classes.downloadLocationItem}>
          <ListItemText primary='Always ask download location' />
          <div>
            <FileUploadButton
              size='small'
              variant='raised'
              disabled={!os.alwaysAskDownloadLocation}
              webkitdirectory='webkitdirectory'
              onChange={(evt) => settingsActions.sub.os.setDefaultDownloadLocation(evt.target.files[0].path)}>
              <FolderIcon className={classes.buttonIcon} />
              Select location
            </FileUploadButton>
            {!os.alwaysAskDownloadLocation ? undefined : <span className={classes.downloadLocation}>{os.defaultDownloadLocation}</span>}
          </div>
          <ListItemSecondaryAction>
            <Switch
              color='primary'
              onChange={(evt, toggled) => settingsActions.sub.os.setAlwaysAskDownloadLocation(toggled)}
              checked={os.alwaysAskDownloadLocation} />
          </ListItemSecondaryAction>
        </SettingsListItem>
        <SettingsListItemSwitch
          label='Show notification when download completes'
          onChange={(evt, toggled) => settingsActions.sub.os.setDownloadNotificationEnabled(toggled)}
          checked={os.downloadNotificationEnabled} />
        <SettingsListItemSwitch
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
