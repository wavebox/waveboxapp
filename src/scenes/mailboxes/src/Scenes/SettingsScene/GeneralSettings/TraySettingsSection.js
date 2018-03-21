import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem, TextField, Divider } from 'material-ui'
import { TrayIconEditor } from 'Components/Tray'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'Components/Grid'
import {
  GTK_UPDATE_MODES,
  POPOUT_POSITIONS,
  SUPPORTS_DOCK_HIDING,
  SUPPORTS_TASKBAR_HIDING,
  IS_GTK_PLATFORM,
  CTX_MENU_ONLY_SUPPORT,
  SUPPORTS_CLICK_ACTIONS,
  CLICK_ACTIONS
} from 'shared/Models/Settings/TraySettings'

export default class TraySettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tray: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the actions for a tray
  * @return jsx array
  */
  renderTrayActionOptions () {
    return [
      (<MenuItem
        key={CLICK_ACTIONS.TOGGLE_POPOUT}
        value={CLICK_ACTIONS.TOGGLE_POPOUT}
        primaryText='Toggle Popout' />),
      (<MenuItem
        key={CLICK_ACTIONS.SHOW_POPOUT}
        value={CLICK_ACTIONS.SHOW_POPOUT}
        primaryText='Show Popout' />),
      (<MenuItem
        key={CLICK_ACTIONS.HIDE_POPOUT}
        value={CLICK_ACTIONS.HIDE_POPOUT}
        primaryText='Hide Popout' />),
      (<Divider key='div-1' />),
      (<MenuItem
        key={CLICK_ACTIONS.TOGGLE_APP}
        value={CLICK_ACTIONS.TOGGLE_APP}
        primaryText='Toggle App' />),
      (<MenuItem
        key={CLICK_ACTIONS.SHOW_APP}
        value={CLICK_ACTIONS.SHOW_APP}
        primaryText='Show App' />),
      (<MenuItem
        key={CLICK_ACTIONS.HIDE_APP}
        value={CLICK_ACTIONS.HIDE_APP}
        primaryText='Hide App' />),
      (<Divider key='div-2' />),
      (<MenuItem
        key={CLICK_ACTIONS.NONE}
        value={CLICK_ACTIONS.NONE}
        primaryText='Do nothing' />)
    ]
  }

  render () {
    const {tray, showRestart, ...passProps} = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>{process.platform === 'darwin' ? 'Menu Bar' : 'Tray'}</h1>
        <Toggle
          toggled={tray.show}
          label='Show icon'
          labelPosition='right'
          onToggle={(evt, toggled) => settingsActions.sub.tray.setShowTrayIcon(toggled)} />
        <Toggle
          toggled={tray.showUnreadCount}
          label='Show unread count'
          labelPosition='right'
          disabled={!tray.show}
          onToggle={(evt, toggled) => settingsActions.sub.tray.setShowTrayUnreadCount(toggled)} />
        {SUPPORTS_DOCK_HIDING ? (
          <Toggle
            toggled={tray.removeFromDockDarwin}
            label='Remove from dock when all windows are hidden'
            labelPosition='right'
            disabled={!tray.show}
            onToggle={(evt, toggled) => settingsActions.sub.tray.setRemoveFromDockDarwin(toggled)} />
        ) : undefined}
        {SUPPORTS_TASKBAR_HIDING ? (
          <Toggle
            toggled={tray.removeFromTaskbarWin32}
            label='Remove from taskbar when main window is minimized'
            labelPosition='right'
            disabled={!tray.show}
            onToggle={(evt, toggled) => settingsActions.sub.tray.setRemoveFromTaskbarWin32(toggled)} />
        ) : undefined}
        {IS_GTK_PLATFORM ? (
          <SelectField
            fullWidth
            floatingLabelText='GTK icon update mode (Requires Restart)'
            disabled={!tray.show}
            onChange={(evt, index, value) => {
              settingsActions.sub.tray.setTrayGtkUpdateMode(value)
              showRestart()
            }}
            value={tray.gtkUpdateMode}>
            <MenuItem
              value={GTK_UPDATE_MODES.UPDATE}
              label='Update'
              primaryText='Update: recommended for most installations' />
            <MenuItem
              value={GTK_UPDATE_MODES.RECREATE}
              label='Recreate'
              primaryText='Recreate: force the icon to recreate itself, useful if you see rendering issues' />
            <MenuItem
              value={GTK_UPDATE_MODES.STATIC}
              label='Static'
              primaryText={`Static: don't display dynamic information in the icon`} />
          </SelectField>
        ) : undefined}
        <Row>
          <Col md={6}>
            <SelectField
              fullWidth
              floatingLabelText='DPI Multiplier'
              disabled={!tray.show}
              value={tray.dpiMultiplier}
              onChange={(evt, index, value) => settingsActions.sub.tray.setDpiMultiplier(value)}>
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
              floatingLabelText={`Icon Size (Pixels) ${IS_GTK_PLATFORM && tray.gtkUpdateMode === GTK_UPDATE_MODES.STATIC ? ' (Requires Restart)' : ''}`}
              defaultValue={tray.iconSize}
              onBlur={(evt) => {
                settingsActions.sub.tray.setTrayIconSize(evt.target.value)
                if (IS_GTK_PLATFORM && tray.gtkUpdateMode === GTK_UPDATE_MODES.STATIC) {
                  showRestart()
                }
              }} />
          </Col>
        </Row>
        {CTX_MENU_ONLY_SUPPORT ? undefined : (
          <SelectField
            fullWidth
            floatingLabelText='Popout screen position'
            disabled={!tray.show}
            onChange={(evt, index, value) => { settingsActions.sub.tray.setPopoutPosition(value) }}
            value={tray.popoutPosition}>
            <MenuItem
              value={POPOUT_POSITIONS.AUTO}
              label='Auto'
              primaryText='Auto: Position popover automatically' />
            <MenuItem
              value={POPOUT_POSITIONS.TOP_CENTER}
              label='Top Center'
              primaryText='Top Center: Centered above the icon' />
            <MenuItem
              value={POPOUT_POSITIONS.TOP_LEFT}
              label='Top Left:'
              primaryText='Top Left: Above the icon to the left' />
            <MenuItem
              value={POPOUT_POSITIONS.TOP_RIGHT}
              label='Top Right'
              primaryText='Top Right: Above the icon to the right' />
            <MenuItem
              value={POPOUT_POSITIONS.BOTTOM_CENTER}
              label='Bottom Center'
              primaryText='Bottom Center: Centered below the icon' />
            <MenuItem
              value={POPOUT_POSITIONS.BOTTOM_LEFT}
              label='Bottom Left'
              primaryText='Bottom Left: Below the icon to the left' />
            <MenuItem
              value={POPOUT_POSITIONS.BOTTOM_RIGHT}
              label='Bottom Right'
              primaryText='Bottom Right: Below the icon to the right' />
          </SelectField>
        )}

        <br />
        <TrayIconEditor tray={tray} />
        <br />

        {!CTX_MENU_ONLY_SUPPORT && SUPPORTS_CLICK_ACTIONS ? (
          <div>
            <hr style={styles.subsectionRule} />
            <h1 style={styles.subsectionheading}>Tray Mouse Actions</h1>
            <Row>
              <Col md={6}>
                <SelectField
                  fullWidth
                  floatingLabelText='Click Action'
                  disabled={!tray.show}
                  onChange={(evt, index, value) => { settingsActions.sub.tray.setClickAction(value) }}
                  value={tray.clickAction}>
                  {this.renderTrayActionOptions()}
                </SelectField>
              </Col>
              <Col md={6}>
                <SelectField
                  fullWidth
                  floatingLabelText='Alt Click Action'
                  disabled={!tray.show}
                  onChange={(evt, index, value) => { settingsActions.sub.tray.setAltClickAction(value) }}
                  value={tray.altClickAction}>
                  {this.renderTrayActionOptions()}
                </SelectField>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <SelectField
                  fullWidth
                  floatingLabelText='Right Click Action'
                  disabled={!tray.show}
                  onChange={(evt, index, value) => { settingsActions.sub.tray.setRightClickAction(value) }}
                  value={tray.rightClickAction}>
                  {this.renderTrayActionOptions()}
                </SelectField>
              </Col>
              <Col md={6}>
                <SelectField
                  fullWidth
                  floatingLabelText='Double Click Action'
                  disabled={!tray.show}
                  onChange={(evt, index, value) => { settingsActions.sub.tray.setDoubleClickAction(value) }}
                  value={tray.doubleClickAction}>
                  {this.renderTrayActionOptions()}
                </SelectField>
              </Col>
            </Row>
          </div>
        ) : undefined}
      </Paper>
    )
  }
}
