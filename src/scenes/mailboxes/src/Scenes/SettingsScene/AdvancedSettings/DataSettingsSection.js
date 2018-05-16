import PropTypes from 'prop-types'
import React from 'react'
import { ipcRenderer } from 'electron'
import { Paper, FontIcon } from 'material-ui' //TODO
import { mailboxActions } from 'stores/mailbox'
import { crextensionActions } from 'stores/crextension'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { ConfirmFlatButton } from 'Components/Buttons'
import { WB_CLEAN_EXPIRED_SESSIONS } from 'shared/ipcEvents'

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
    const { showRestart, style, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={{...styles.paper, ...style}} {...passProps}>
        <h1 style={styles.subheading}>Data</h1>
        <div>
          <ConfirmFlatButton
            label='Clear all browsing data'
            confirmLabel='Click again to confirm'
            confirmWaitMs={4000}
            icon={<FontIcon className='material-icons'>clear</FontIcon>}
            confirmIcon={<FontIcon className='material-icons'>help_outline</FontIcon>}
            onConfirmedClick={() => {
              mailboxActions.clearAllBrowserSessions()
              crextensionActions.clearAllBrowserSessions()
            }} />
          <div style={styles.flatButtonHelp}>
            You will need to sign back into all accounts after doing this
          </div>
          <ConfirmFlatButton
            label='Clean expired accounts'
            confirmLabel='Click again to confirm'
            confirmWaitMs={4000}
            icon={<FontIcon className='material-icons'>clear</FontIcon>}
            confirmIcon={<FontIcon className='material-icons'>help_outline</FontIcon>}
            onConfirmedClick={() => {
              ipcRenderer.send(WB_CLEAN_EXPIRED_SESSIONS, {})
            }} />
        </div>
      </Paper>
    )
  }
}
