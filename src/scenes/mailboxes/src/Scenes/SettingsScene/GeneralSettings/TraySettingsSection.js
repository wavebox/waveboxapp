import PropTypes from 'prop-types'
import React from 'react'
import { TrayIconEditor } from 'Components/Tray'
import { TextField, Icon } from 'material-ui'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'
import {
  GTK_UPDATE_MODES,
  POPOUT_POSITIONS,
  SUPPORTS_DOCK_HIDING,
  SUPPORTS_TASKBAR_HIDING,
  IS_GTK_PLATFORM,
  IS_SOMETIMES_CTX_MENU_ONLY_PLATFORM,
  SUPPORTS_ADDITIONAL_CLICK_EVENTS,
  CLICK_ACTIONS
} from 'shared/Models/Settings/TraySettings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListSelect from 'wbui/SettingsListSelect'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from 'material-ui/styles'
import blue from 'material-ui/colors/blue'
import classNames from 'classnames'

const styles = {
  inputHelpTextInfo: {
    fontSize: '75%',
    marginTop: -10,
    color: blue[700]
  },
  inputHelpIconInfo: {
    color: blue[700],
    fontSize: '85%',
    marginRight: 5
  }
}

const TRAY_ACTION_OPTIONS = [
  { value: CLICK_ACTIONS.TOGGLE_POPOUT, label: 'Toggle Popout' },
  { value: CLICK_ACTIONS.SHOW_POPOUT, label: 'Show Popout' },
  { value: CLICK_ACTIONS.HIDE_POPOUT, label: 'Hide Popout' },
  { divider: true },
  { value: CLICK_ACTIONS.TOGGLE_APP, label: 'Toggle App' },
  { value: CLICK_ACTIONS.SHOW_APP, label: 'Show App' },
  { value: CLICK_ACTIONS.HIDE_APP, label: 'Hide App' },
  { divider: true },
  { value: CLICK_ACTIONS.NONE, label: 'Do nothing' }
]

@withStyles(styles)
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

  render () {
    const {tray, showRestart, classes, ...passProps} = this.props

    return (
      <div {...passProps}>
        <SettingsListSection title={process.platform === 'darwin' ? 'Menu Bar' : 'Tray'}>
          <SettingsListSwitch
            label='Show icon'
            onChange={(evt, toggled) => settingsActions.sub.tray.setShowTrayIcon(toggled)}
            checked={tray.show} />
          <SettingsListSwitch
            label='Show unread count'
            disabled={!tray.show}
            onChange={(evt, toggled) => settingsActions.sub.tray.setShowTrayUnreadCount(toggled)}
            checked={tray.showUnreadCount} />
          {SUPPORTS_DOCK_HIDING ? (
            <SettingsListSwitch
              label='Remove from dock when all windows are hidden'
              onChange={(evt, toggled) => settingsActions.sub.tray.setRemoveFromDockDarwin(toggled)}
              disabled={!tray.show}
              checked={tray.removeFromDockDarwin} />
          ) : undefined}
          {SUPPORTS_TASKBAR_HIDING ? (
            <SettingsListSwitch
              label='Remove from taskbar when main window is minimized'
              onChange={(evt, toggled) => settingsActions.sub.tray.setRemoveFromTaskbarWin32(toggled)}
              disabled={!tray.show}
              checked={tray.removeFromTaskbarWin32} />
          ) : undefined}
          {IS_GTK_PLATFORM ? (
            <SettingsListSelect
              label='GTK icon update mode (Requires Restart)'
              disabled={!tray.show}
              value={tray.gtkUpdateMode}
              options={[
                { value: GTK_UPDATE_MODES.UPDATE, label: 'Update', primaryText: 'Update: recommended for most installations' },
                { value: GTK_UPDATE_MODES.RECREATE, label: 'Recreate', primaryText: 'Recreate: force the icon to recreate itself, useful if you see rendering issues' },
                { value: GTK_UPDATE_MODES.STATIC, label: 'Static', primaryText: `Static: don't display dynamic information in the icon` }
              ]}
              onChange={(evt, value) => {
                settingsActions.sub.tray.setTrayGtkUpdateMode(value)
                showRestart()
              }} />
          ) : undefined}
          <SettingsListSelect
            label='DPI Multiplier'
            disabled={!tray.show}
            value={`${tray.dpiMultiplier}`}
            options={[
              { value: '1', label: '1x' },
              { value: '2', label: '2x' },
              { value: '3', label: '3x' },
              { value: '4', label: '4x' },
              { value: '5', label: '5x' }
            ]}
            onChange={(evt, value) => settingsActions.sub.tray.setDpiMultiplier(parseInt(value))} />
          <SettingsListItem>
            <TextField
              defaultValue={tray.iconSize}
              type='number'
              InputLabelProps={{ shrink: true }}
              disabled={!tray.show}
              label={`Icon Size (Pixels) ${IS_GTK_PLATFORM && tray.gtkUpdateMode === GTK_UPDATE_MODES.STATIC ? ' (Requires Restart)' : ''}`}
              placeholder='32'
              margin='dense'
              onBlur={(evt) => {
                settingsActions.sub.tray.setTrayIconSize(evt.target.value)
                if (IS_GTK_PLATFORM && tray.gtkUpdateMode === GTK_UPDATE_MODES.STATIC) {
                  showRestart()
                }
              }} />
          </SettingsListItem>
          <SettingsListSelect
            label='Popout screen position'
            secondary={IS_SOMETIMES_CTX_MENU_ONLY_PLATFORM ? (
              <span className={classes.inputHelpTextInfo}>
                <Icon className={classNames(classes.inputHelpIconInfo, 'far fa-info-circle')} />
                This setting only takes effect when your OS uses GtkStatusIcon
              </span>
            ) : undefined}
            disabled={!tray.show}
            value={tray.popoutPosition}
            options={[
              {
                value: POPOUT_POSITIONS.AUTO,
                label: 'Auto',
                primaryText: 'Auto: Position popover automatically'
              },
              {
                value: POPOUT_POSITIONS.TOP_CENTER,
                label: 'Top Center',
                primaryText: process.platform === 'linux' ? (
                  'Top Center: Centered at the top of the screen'
                ) : (
                  'Top Center: Centered above the icon'
                )
              },
              {
                value: POPOUT_POSITIONS.TOP_LEFT,
                label: 'Top Left',
                primaryText: process.platform === 'linux' ? (
                  'Top Left: In the top left of the screen'
                ) : (
                  'Top Left: Above the icon to the left'
                )
              },
              {
                value: POPOUT_POSITIONS.TOP_RIGHT,
                label: 'Top Right',
                primaryText: process.platform === 'linux' ? (
                  'Top Right: In the top right of the screen'
                ) : (
                  'Top Right: Above the icon to the right'
                )
              },
              {
                value: POPOUT_POSITIONS.BOTTOM_CENTER,
                label: 'Bottom Center',
                primaryText: process.platform === 'linux' ? (
                  'Bottom Center: Centered at the bottom of the screen'
                ) : (
                  'Bottom Center: Centered below the icon'
                )
              },
              {
                value: POPOUT_POSITIONS.BOTTOM_LEFT,
                label: 'Bottom Left',
                primaryText: process.platform === 'linux' ? (
                  'Bottom Left: In the bottom left of the screen'
                ) : (
                  'Bottom Left: Below the icon to the left'
                )
              },
              {
                value: POPOUT_POSITIONS.BOTTOM_RIGHT,
                label: 'Bottom Right',
                primaryText: process.platform === 'linux' ? (
                  'Bottom Right: In the bottom right of the screen'
                ) : (
                  'Bottom Right: Below the icon to the right'
                )
              }
            ]}
            onChange={(evt, value) => settingsActions.sub.tray.setPopoutPosition(value)} />
          <SettingsListItem divider={false}>
            <TrayIconEditor tray={tray} />
          </SettingsListItem>
        </SettingsListSection>
        <SettingsListSection title={process.platform === 'darwin' ? 'Menu Bar' : 'Tray'} subtitle='Mouse Actions'>
          <SettingsListSelect
            label='Click Action'
            secondary={IS_SOMETIMES_CTX_MENU_ONLY_PLATFORM ? (
              <span className={classes.inputHelpTextInfo}>
                <Icon className={classNames(classes.inputHelpIconInfo, 'far fa-info-circle')} />
                This setting only takes effect when your OS uses GtkStatusIcon
              </span>
            ) : undefined}
            disabled={!tray.show}
            value={tray.clickAction}
            options={TRAY_ACTION_OPTIONS}
            onChange={(evt, value) => settingsActions.sub.tray.setClickAction(value)} />
          {SUPPORTS_ADDITIONAL_CLICK_EVENTS ? (
            <SettingsListSelect
              label='Alt Click Action'
              disabled={!tray.show}
              value={tray.altClickAction}
              options={TRAY_ACTION_OPTIONS}
              onChange={(evt, value) => settingsActions.sub.tray.setAltClickAction(value)} />
          ) : undefined}
          {SUPPORTS_ADDITIONAL_CLICK_EVENTS ? (
            <SettingsListSelect
              label='Right Click Action'
              value={tray.rightClickAction}
              disabled={!tray.show}
              options={TRAY_ACTION_OPTIONS}
              onChange={(evt, value) => settingsActions.sub.tray.setRightClickAction(value)} />
          ) : undefined}
          {SUPPORTS_ADDITIONAL_CLICK_EVENTS ? (
            <SettingsListSelect
              divider={false}
              label='Double Click Action'
              disabled={!tray.show}
              value={tray.doubleClickAction}
              options={TRAY_ACTION_OPTIONS}
              onChange={(evt, value) => settingsActions.sub.tray.setDoubleClickAction(value)} />
          ) : undefined}
        </SettingsListSection>
      </div>
    )
  }
}
