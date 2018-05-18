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
import { withStyles } from 'material-ui/styles'
import ConfirmButton from 'wbui/ConfirmButton'
import blue from 'material-ui/colors/blue'
import { Button } from 'material-ui'
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
  },
  buttonHelp: {
    color: blue[700],
    fontSize: '75%',
    marginTop: 10
  }
}

@withStyles(styles)
export default class DataSettingsSection extends React.Component {
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
      <SettingsListSection {...passProps} title='Data'>
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
          <div className={classes.buttonHelp}>
            You will need to sign back into all accounts after doing this
          </div>
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
        <SettingsListItem className={classes.listItem}>
          <Button variant='raised' size='small' onClick={() => ipcRenderer.send(WB_TAKEOUT_EXPORT)}>
            <ImportExportIcon className={classes.buttonIcon} />
            Export Data
          </Button>
        </SettingsListItem>
        <SettingsListItem className={classes.listItem} divider={false}>
          <Button variant='raised' size='small' onClick={() => ipcRenderer.send(WB_TAKEOUT_IMPORT)}>
            <ImportExportIcon className={classes.buttonIcon} />
            Import Data
          </Button>
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}
