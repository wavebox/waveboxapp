import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListAccordionSection from 'wbui/SettingsListAccordionSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListAccordionDeferred from 'wbui/SettingsListAccordionDeferred'
import DeleteIcon from '@material-ui/icons/Delete'
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore'
import { withStyles } from '@material-ui/core/styles'
import { ListItemText, TextField, IconButton, ListItemSecondaryAction, Tooltip } from '@material-ui/core'
import blue from '@material-ui/core/colors/blue'
import KeyboardIcon from '@material-ui/icons/Keyboard'

const ACCELERATOR_NAMES = {
  // Global
  globalToggleApp: 'Toggle App',
  globalToggleWaveboxMini: 'Toggle Wavebox Mini',
  globalShowAppMailbox0: 'Show account in 1st position',
  globalShowAppMailbox1: 'Show account in 2nd position',
  globalShowAppMailbox2: 'Show account in 3rd position',
  globalShowAppMailbox3: 'Show account in 4th position',
  globalShowAppMailbox4: 'Show account in 5th position',
  globalShowAppMailbox5: 'Show account in 6th position',
  globalShowAppMailbox6: 'Show account in 7th position',
  globalShowAppMailbox7: 'Show account in 8th position',
  globalShowAppMailbox8: 'Show account in 9th position',
  globalShowAppMailbox9: 'Show account in 10th position',

  // Application
  preferences: 'Preferences',
  composeMail: 'Compose Mail',
  composeMailHere: 'Compose Mail in current tab',
  closeWindow: 'Close Window',
  hide: process.platform === 'darwin' ? 'Hide Wavebox' : 'Hide Window',
  hideOthers: 'Hide Others',
  quit: 'Quit',

  // Edit
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  pasteAndMatchStyle: 'Paste and Match Style',
  selectAll: 'Select All',
  copyCurrentTabUrl: 'Copy Current Tab URL',
  find: 'Find',
  findNext: 'Find Next',

  // View
  toggleFullscreen: 'Toggle Fullscreen',
  toggleSidebar: 'Toggle Sidebar',
  toggleMenu: 'Toggle Menu',
  navigateBack: 'Navigate Back',
  navigateForward: 'Navigate Forward',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  zoomReset: 'Zoom Reset',
  reload: 'Reload',
  reloadWavebox: 'Reload Wavebox Window',
  developerTools: 'Developer Tools',
  developerToolsWavebox: 'Wavebox Developer Tools',

  // Accounts
  previousMailbox: 'Previous Account',
  nextMailbox: 'Next Account',
  mailboxIndex: 'Account at Index',
  servicePrevious: 'Previous Service',
  serviceNext: 'Next Service',
  serviceIndex: 'Service at Index',

  // Window
  minimize: 'Minimize',
  cycleWindows: 'Cycle Windows',
  nextTab: 'Next Tab',
  prevTab: 'Previous Tab',
  toggleWaveboxMini: 'Toggle Wavebox Mini'
}
const GLOBAL_SECTION = [
  'globalToggleApp',
  'globalToggleWaveboxMini',
  'globalShowAppMailbox0',
  'globalShowAppMailbox1',
  'globalShowAppMailbox2',
  'globalShowAppMailbox3',
  'globalShowAppMailbox4',
  'globalShowAppMailbox5',
  'globalShowAppMailbox6',
  'globalShowAppMailbox7',
  'globalShowAppMailbox8',
  'globalShowAppMailbox9'
]
const APPLICATION_SECTION = [
  'preferences',
  'composeMail',
  'composeMailHere',
  'closeWindow',
  'hide',
  'hideOthers',
  'quit'
]
const EDIT_SECTION = [
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'pasteAndMatchStyle',
  'selectAll',
  'copyCurrentTabUrl',
  'find',
  'findNext'
]
const VIEW_SECTION = [
  'toggleFullscreen',
  'toggleSidebar',
  'toggleMenu',
  'navigateBack',
  'navigateForward',
  'zoomIn',
  'zoomOut',
  'zoomReset',
  'reload',
  'reloadWavebox',
  'developerTools',
  'developerToolsWavebox'
]
const ACCOUNTS_SECTION = [
  'previousMailbox',
  'nextMailbox',
  'mailboxIndex',
  'servicePrevious',
  'serviceNext',
  'serviceIndex'
]
const WINDOW_SECTION = [
  'minimize',
  'cycleWindows',
  'nextTab',
  'prevTab',
  'toggleWaveboxMini'
]
const SECTIONS = [
  { name: 'Application', items: APPLICATION_SECTION },
  { name: 'Edit', items: EDIT_SECTION },
  { name: 'View', items: VIEW_SECTION },
  { name: 'Account', items: ACCOUNTS_SECTION },
  { name: 'Window', items: WINDOW_SECTION },
  { name: 'Global', subtitle: 'These shortcuts will also work when Wavebox is minimized or out of focus', items: GLOBAL_SECTION }
]
const PLATFORM_EXCLUDES = new Set([
  process.platform === 'darwin' ? 'toggleMenu' : undefined,
  process.platform !== 'darwin' ? 'hideOthers' : undefined
].filter((n) => !!n))

const styles = {
  subtitleInfo: {
    color: blue[700],
    fontSize: '85%'
  },
  textFieldInput: {
    fontSize: '0.8rem',
    width: 180
  }
}

// This has been split out into its own control because the performance of re-rendering
// Tooltip in material-ui:1.0.0 is terrible. @Thomas101 refactor this when performance returns
class AcceleratorSettingsSectionActionButton extends React.Component {
  static propTypes = {
    // Keep props primitive so we can prevent updates
    acceleratorDefault: PropTypes.string,
    name: PropTypes.string.isRequired
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { acceleratorDefault, name } = this.props

    if (acceleratorDefault) {
      return (
        <Tooltip title={`Restore Default (${acceleratorDefault})`}>
          <IconButton onClick={() => settingsActions.sub.accelerators.restoreDefault(name)}>
            <SettingsBackupRestoreIcon />
          </IconButton>
        </Tooltip>
      )
    } else {
      return (
        <IconButton onClick={() => settingsActions.sub.accelerators.restoreDefault(name)}>
          <DeleteIcon />
        </IconButton>
      )
    }
  }
}

@withStyles(styles)
class AcceleratorSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    accelerators: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the accelerator section
  * @param accelerators: the accelerators
  * @param section: the section to render
  * @return jsx
  */
  renderAcceleratorSection (classes, accelerators, section) {
    return (
      <SettingsListAccordionSection>
        {section.subtitle ? (
          <SettingsListItem className={classes.subtitleInfo}>
            {section.subtitle}
          </SettingsListItem>
        ) : undefined}
        {section.items.map((name, index, items) => {
          if (PLATFORM_EXCLUDES.has(name)) { return undefined }

          const accelerator = accelerators[name]
          const acceleratorDefault = accelerators[name + 'Default']

          return (
            <SettingsListItem key={name} divider={index !== items.length - 1}>
              <ListItemText primary={ACCELERATOR_NAMES[name]} />
              <ListItemSecondaryAction>
                <TextField
                  key={`AcceleratorSettings_${name}_${accelerator}`}
                  name={`AcceleratorSettings_${name}`}
                  defaultValue={accelerator}
                  margin='dense'
                  placeholder={acceleratorDefault || '...'}
                  onBlur={(evt) => settingsActions.sub.accelerators.set(name, evt.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    className: classes.textFieldInput
                  }} />
                <AcceleratorSettingsSectionActionButton
                  name={name}
                  acceleratorDefault={acceleratorDefault} />
              </ListItemSecondaryAction>
            </SettingsListItem>
          )
        })}
      </SettingsListAccordionSection>
    )
  }

  render () {
    const {
      accelerators,
      classes,
      ...passProps
    } = this.props

    return (
      <SettingsListAccordionDeferred
        title='Keyboard Shortcuts'
        icon={<KeyboardIcon />}
        {...passProps}
        panels={SECTIONS.map((section) => {
          return {
            title: 'Keyboard Shortcuts',
            subtitle: section.name,
            render: () => this.renderAcceleratorSection(classes, accelerators, section)
          }
        })} />
    )
  }
}

export default AcceleratorSettingsSection
