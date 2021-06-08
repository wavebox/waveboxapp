import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import { userStore } from 'stores/user'
import { AppSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import { withStyles } from '@material-ui/core/styles'
import { TextField, ListItemText } from '@material-ui/core'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import NetworkWifiIcon from '@material-ui/icons/NetworkWifi'
import SettingsListItem from 'wbui/SettingsListItem'

const styles = {
  manualProxyListItem: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  manualProxyTextFieldContainer: {
    display: 'flex',
    width: '100%'
  },
  manualProxyTextField: {
    marginLeft: 4,
    marginRight: 4
  },
  manualProxyTextFieldInput: {
    fontSize: '0.8rem'
  }
}

@withStyles(styles)
class NetworkSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.app, nextProps.app, [
        'rawAppThreadFetchMicrosoftHTTP',
        'proxyMode',
        'proxyServer',
        'proxyPort'
      ]) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
  }

  render () {
    const {
      showRestart,
      app,
      classes,
      ...passProps
    } = this.props

    return (
      <SettingsListSection {...passProps} title='Network' icon={<NetworkWifiIcon />}>
        <SettingsListItemSelectInline
          label='Proxy mode (Requires Restart)'
          value={app.proxyMode}
          options={[
            { value: AppSettings.PROXY_MODES.AUTO, label: 'Auto', primaryText: 'Auto' },
            { value: AppSettings.PROXY_MODES.DISABLED, label: 'Disabled', primaryText: 'Disabled' },
            { value: AppSettings.PROXY_MODES.SOCKS_MANUAL, label: 'SOCKS5 Proxy', primaryText: 'Custom SOCKS5 Proxy' },
            { value: AppSettings.PROXY_MODES.HTTP_MANUAL, label: 'HTTP Proxy', primaryText: 'Custom HTTP Proxy' }
          ]}
          onChange={(evt, value) => {
            settingsActions.sub.app.setProxyMode(value)
            showRestart()
          }} />
        {app.proxyMode === AppSettings.PROXY_MODES.SOCKS_MANUAL || app.proxyMode === AppSettings.PROXY_MODES.HTTP_MANUAL ? (
          <SettingsListItem className={classes.manualProxyListItem}>
            <ListItemText>
              Custom proxy configuration (Requires Restart)
            </ListItemText>
            <div className={classes.manualProxyTextFieldContainer}>
              <TextField
                label='Server'
                margin='dense'
                fullWidth
                error={!app.proxyServer}
                helperText={!app.proxyServer ? 'Proxy settings are only applied when server is provided' : undefined}
                defaultValue={app.proxyServer}
                placeholder='127.0.0.1'
                onBlur={(evt) => {
                  settingsActions.sub.app.setProxyServer(evt.target.value)
                  showRestart()
                }}
                InputLabelProps={{ shrink: true }}
                className={classes.manualProxyTextField}
                InputProps={{ className: classes.manualProxyTextFieldInput }} />
              <TextField
                label='Port'
                margin='dense'
                fullWidth
                error={!app.proxyPort}
                helperText={!app.proxyPort ? 'Proxy settings are only applied when port is provided' : undefined}
                defaultValue={app.proxyPort}
                placeholder='8888'
                onBlur={(evt) => {
                  settingsActions.sub.app.setProxyPort(evt.target.value)
                  showRestart()
                }}
                InputLabelProps={{ shrink: true }}
                className={classes.manualProxyTextField}
                InputProps={{ className: classes.manualProxyTextFieldInput }} />
            </div>
          </SettingsListItem>
        ) : undefined}
        <SettingsListItemSwitch
          divider={false}
          label='Microsoft Account Network stack v2'
          onChange={(evt, toggled) => settingsActions.sub.app.setAppThreadFetchMicrosoftHTTP(toggled)}
          checked={userStore.getState().wceUseAppThreadFetchMicrosoftHTTP(app.rawAppThreadFetchMicrosoftHTTP)} />
      </SettingsListSection>
    )
  }
}

export default NetworkSettingsSection
