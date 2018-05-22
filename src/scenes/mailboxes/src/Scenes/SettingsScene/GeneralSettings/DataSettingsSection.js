import PropTypes from 'prop-types'
import React from 'react'
import { ipcRenderer } from 'electron'
import { mailboxActions } from 'stores/mailbox'
import { crextensionActions } from 'stores/crextension'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import ClearIcon from '@material-ui/icons/Clear'
import ImportExportIcon from '@material-ui/icons/ImportExport'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { withStyles } from '@material-ui/core/styles'
import ConfirmButton from 'wbui/ConfirmButton'
import StorageIcon from '@material-ui/icons/Storage'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import SettingsListTypography from 'wbui/SettingsListTypography'
import {
  WB_CLEAN_EXPIRED_SESSIONS,
  WB_TAKEOUT_IMPORT,
  WB_TAKEOUT_EXPORT
} from 'shared/ipcEvents'

const styles = {
  listItem: {
    display: 'block'
  },
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18
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
      <SettingsListSection {...passProps} title='Data' icon={<StorageIcon />}>
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
              mailboxActions.clearAllBrowserSessions()
              crextensionActions.clearAllBrowserSessions()
            }} />
          <SettingsListTypography type='info' variant='button-help'>
            You will need to sign back into all accounts after doing this
          </SettingsListTypography>
        </SettingsListItem>
        <SettingsListItem className={classes.listItem}>
          <ConfirmButton
            variant='raised'
            size='small'
            content={(
              <span>
                <ClearIcon className={classes.buttonIcon} />
                Clean expired accounts
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
              ipcRenderer.send(WB_CLEAN_EXPIRED_SESSIONS, {})
            }} />
        </SettingsListItem>
        <SettingsListItemButton
          label='Export Data'
          icon={<ImportExportIcon />}
          onClick={() => {
            ipcRenderer.send(WB_TAKEOUT_EXPORT)
          }} />
        <SettingsListItemButton
          label='Import Data'
          divider={false}
          icon={<ImportExportIcon />}
          onClick={() => {
            ipcRenderer.send(WB_TAKEOUT_IMPORT)
          }} />
      </SettingsListSection>
    )
  }
}

export default DataSettingsSection
