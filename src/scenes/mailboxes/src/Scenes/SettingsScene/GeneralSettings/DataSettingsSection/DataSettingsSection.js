import PropTypes from 'prop-types'
import React from 'react'
import { ipcRenderer } from 'electron'
import { accountActions } from 'stores/account'
import { crextensionActions } from 'stores/crextension'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import ClearIcon from '@material-ui/icons/Clear'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { withStyles } from '@material-ui/core/styles'
import ConfirmButton from 'wbui/ConfirmButton'
import StorageIcon from '@material-ui/icons/Storage'
import SettingsListTypography from 'wbui/SettingsListTypography'
import SettingsListItemConfirmButton from 'wbui/SettingsListItemConfirmButton'
import SettingsListItemMultiButtons from 'wbui/SettingsListItemMultiButtons'
import CloudProfileSyncListItem from './CloudProfileSyncListItem'
import {
  WB_CLEAN_EXPIRED_SESSIONS,
  WB_TAKEOUT_IMPORT_FILE,
  WB_TAKEOUT_EXPORT_FILE
} from 'shared/ipcEvents'
import FASCloudDownloadIcon from 'wbfa/FASCloudDownload'
import FASCloudUploadIcon from 'wbfa/FASCloudUpload'

const styles = {
  listItem: {
    display: 'block'
  },
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18,
    verticalAlign: 'middle'
  }
}

@withStyles(styles)
class DataSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, classes, ...passProps } = this.props
    return (
      <SettingsListSection {...passProps} title='Data & Sync' icon={<StorageIcon />}>
        <CloudProfileSyncListItem />
        <SettingsListItemMultiButtons
          primary={<strong>File Import & Export</strong>}
          buttons={[
            {
              label: 'Export data',
              icon: (<FASCloudDownloadIcon />),
              onClick: () => { ipcRenderer.send(WB_TAKEOUT_EXPORT_FILE) }
            },
            {
              label: 'Import data',
              icon: (<FASCloudUploadIcon />),
              onClick: () => { ipcRenderer.send(WB_TAKEOUT_IMPORT_FILE) }
            }
          ]} />
        <SettingsListItem className={classes.listItem}>
          <ConfirmButton
            variant='raised'
            size='small'
            content={(
              <span>
                <ClearIcon className={classes.buttonIcon} />
                Clear all browsing data
              </span>
            )}
            confirmContent={(
              <span>
                <HelpOutlineIcon className={classes.buttonIcon} />
                Click again to confirm
              </span>
            )}
            confirmWaitMs={4000}
            onConfirmedClick={() => {
              accountActions.clearAllBrowserSessions()
              crextensionActions.clearAllBrowserSessions()
            }} />
          <SettingsListTypography type='info' variant='button-help'>
            You will need to sign back into all accounts after doing this
          </SettingsListTypography>
        </SettingsListItem>
        <SettingsListItemConfirmButton
          divider={false}
          label='Clean expired accounts'
          icon={<ClearIcon />}
          confirmLabel='Click again to confirm'
          confirmIcon={<HelpOutlineIcon />}
          confirmWaitMs={4000}
          onConfirmedClick={() => ipcRenderer.send(WB_CLEAN_EXPIRED_SESSIONS, {})} />
      </SettingsListSection>
    )
  }
}

export default DataSettingsSection
