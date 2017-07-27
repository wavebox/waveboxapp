import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, TextField } from 'material-ui'
import { TrayIconEditor } from 'Components/Tray'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'Components/Grid'
import {
  MOUSE_TRIGGERS,
  MOUSE_TRIGGER_ACTIONS,
  SUPPORTS_MOUSE_TRIGGERS,
  SUPPORTS_TRAY_MINIMIZE_CONFIG,
  SUPPORTS_DOCK_HIDING
} from 'shared/Models/Settings/TraySettings'

export default class TraySettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tray: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {tray, ...passProps} = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>{process.platform === 'darwin' ? 'Menu Bar' : 'Tray'}</h1>
        <div>
          <Toggle
            toggled={tray.show}
            label='Show icon'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowTrayIcon(toggled)} />
          <Toggle
            toggled={tray.showUnreadCount}
            label='Show unread count'
            labelPosition='right'
            disabled={!tray.show}
            onToggle={(evt, toggled) => settingsActions.setShowTrayUnreadCount(toggled)} />
          {SUPPORTS_DOCK_HIDING ? (
            <Toggle
              toggled={tray.removeFromDockDarwin}
              label='Remove from dock when all windows are hidden'
              labelPosition='right'
              disabled={!tray.show}
              onToggle={(evt, toggled) => settingsActions.setRemoveFromDockDarwin(toggled)} />
          ) : undefined}
          {SUPPORTS_TRAY_MINIMIZE_CONFIG ? (
            <Toggle
              toggled={tray.hideWhenClosed}
              disabled={!tray.show}
              label='Hide main window to tray on closed'
              labelPosition='right'
              onToggle={(evt, toggled) => { settingsActions.setHideWhenClosed(toggled) }} />
          ) : undefined}
          {SUPPORTS_TRAY_MINIMIZE_CONFIG ? (
            <Toggle
              toggled={tray.hideWhenMinimized}
              disabled={!tray.show}
              label='Hide main window to tray on minimize'
              labelPosition='right'
              onToggle={(evt, toggled) => { settingsActions.setHideWhenMinimized(toggled) }} />
          ) : undefined}
          {SUPPORTS_MOUSE_TRIGGERS ? (
            <SelectField
              fullWidth
              floatingLabelText='Mouse trigger'
              disabled={!tray.show}
              onChange={(evt, index, value) => settingsActions.setMouseTrigger(value)}
              value={tray.mouseTrigger}>
              <MenuItem value={MOUSE_TRIGGERS.SINGLE} primaryText='Single click' />
              <MenuItem value={MOUSE_TRIGGERS.DOUBLE} primaryText='Double click' />
            </SelectField>
          ) : undefined }
          {SUPPORTS_MOUSE_TRIGGERS ? (
            <SelectField
              fullWidth
              floatingLabelText='Mouse trigger action'
              disabled={!tray.show}
              onChange={(evt, index, value) => settingsActions.setMouseTriggerAction(value)}
              value={tray.mouseTriggerAction}>
              <MenuItem value={MOUSE_TRIGGER_ACTIONS.TOGGLE} primaryText='Toggle window visibility' />
              <MenuItem value={MOUSE_TRIGGER_ACTIONS.SHOW} primaryText='Show window' />
            </SelectField>
          ) : undefined }
          <Row>
            <Col md={6}>
              <SelectField
                fullWidth
                floatingLabelText='DPI Multiplier'
                disabled={!tray.show}
                value={tray.dpiMultiplier}
                onChange={(evt, index, value) => settingsActions.setDpiMultiplier(value)}>
                <MenuItem value={1} primaryText='1x' />
                <MenuItem value={2} primaryText='2x' />
                <MenuItem value={3} primaryText='3x' />
                <MenuItem value={4} primaryText='4x' />
                <MenuItem value={5} primaryText='5x' />
              </SelectField>
            </Col>
            <Col md={6}>
              <TextField
                key={tray.iconSize}
                fullWidth
                type='number'
                disabled={!tray.show}
                floatingLabelFixed
                hintText='32'
                floatingLabelText='Icon Size (Pixels)'
                defaultValue={tray.iconSize}
                onBlur={(evt) => settingsActions.setTrayIconSize(evt.target.value)} />
            </Col>
          </Row>
        </div>
        <br />
        <TrayIconEditor tray={tray} />
      </Paper>
    )
  }
}
