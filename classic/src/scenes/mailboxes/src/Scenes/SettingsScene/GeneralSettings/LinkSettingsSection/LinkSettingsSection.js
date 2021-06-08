import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import { OSSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import LinkIcon from '@material-ui/icons/Link'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemText from 'wbui/SettingsListItemText'
import InfoIcon from '@material-ui/icons/Info'
import {
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Button, Dialog, Paper, Divider, Menu, MenuItem
} from '@material-ui/core'
import CustomLinkProviderEditorDialogContent from './CustomLinkProviderEditorDialogContent'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import DistributionConfig from 'Runtime/DistributionConfig'
import SettingsListTypography from 'wbui/SettingsListTypography'

const LINK_OPEN_OPTIONS = [
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.DEFAULT, label: 'Default Behaviour' },
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.BROWSER_OPEN, label: 'Open in Default Browser' },
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.WAVEBOX_OPEN, label: 'Open in Wavebox Window' },
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.ASK, label: 'Ask what to do each time' }
]

const CUSTOM_LINK_PROVIDER_EXAMPLES = {
  darwin: [
    {
      name: 'Google Chrome',
      cmd: 'open',
      args: [ { type: 'url' }, '-a', 'Google Chrome' ]
    },
    {
      name: 'Firefox',
      cmd: 'open',
      args: [ { type: 'url' }, '-a', 'Firefox' ]
    },
    {
      name: 'Safari',
      cmd: 'open',
      args: [ { type: 'url' }, '-a', 'Safari' ]
    }
  ],
  win32: [
    {
      name: 'Google Chrome',
      cmd: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
      args: [ { type: 'url' } ]
    },
    {
      name: 'Google Chrome (Profile 1)',
      cmd: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
      args: [ { type: 'url' }, '--profile-directory="Profile 1"' ]
    },
    {
      name: 'Firefox',
      cmd: `C:\\Program Files\\Mozilla Firefox\\firefox.exe`,
      args: [ { type: 'url' } ]
    }
  ],
  linux: [
    {
      name: 'Google Chrome',
      cmd: 'google-chrome',
      args: [ { type: 'url' } ]
    },
    {
      name: 'Google Chrome (Profile 1)',
      cmd: 'google-chrome',
      args: [ { type: 'url' }, '--profile-directory="Profile 1' ]
    },
    {
      name: 'Firefox',
      cmd: 'firefox',
      args: [ { type: 'url' } ]
    }
  ]
}

const styles = {
  customLinkOpenerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  customLinkOpenerTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center'
  },
  microButton: {
    whiteSpace: 'nowrap',
    paddingTop: 1,
    paddingBottom: 1,
    '& svg': {
      fontSize: '20px'
    }
  },
  customLinkOpenerList: {
    marginTop: 8,
    width: '100%'
  },
  link: {
    color: blue[600],
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}

@withStyles(styles)
class LinkSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.os !== nextProps.os) {
      this.setState(this.deriveOSState(nextProps.os))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveOSState(this.props.os),
      customLinkProviderEditorOpen: false,
      customLinkProviderEditorId: undefined,
      customLinkProviderAddMenuAnchor: undefined
    }
  })()

  /**
  * Derives the state from the OS
  * @param os: the os object
  * @return a state update
  */
  deriveOSState (os) {
    // We derive OS prop into state here, because shallowCompare will do a short
    // depth compare on customLinkProviderNames. It's a bit lazy
    return {
      openLinksInBackground: os.openLinksInBackground,
      linkBehaviourWithShift: os.linkBehaviourWithShift,
      linkBehaviourWithCmdOrCtrl: os.linkBehaviourWithCmdOrCtrl,
      customLinkProviderNames: os.customLinkProviderNames
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles creating a new custom link provider
  * @param evt: the event that fired
  */
  handleCreateNewCustomLinkProvider = (evt) => {
    this.handleCloseCustomLinkProviderAddMenu()
    this.setState({
      customLinkProviderEditorOpen: true,
      customLinkProviderEditorId: undefined,
      customLinkProviderAddMenuAnchor: undefined
    })
  }

  /**
  * Handles editing an existing custom link provider
  * @param evt: the event that fired
  */
  handleEditCustomLinkProvider = (evt, providerId) => {
    this.setState({
      customLinkProviderEditorOpen: true,
      customLinkProviderEditorId: providerId,
      customLinkProviderAddMenuAnchor: undefined
    })
  }

  /**
  * Closes the custom link provider editor
  * @param evt: the event that fired
  */
  handleCloseCustomLinkProviderEditor = (evt) => {
    this.setState({
      customLinkProviderEditorOpen: false,
      customLinkProviderEditorId: undefined,
      customLinkProviderAddMenuAnchor: undefined
    })
  }

  /**
  * Opens the custom link provider menu
  * @param evt: the event that fired
  */
  handleOpenCustomLinkProviderAddMenu = (evt) => {
    this.setState({
      customLinkProviderAddMenuAnchor: evt.target
    })
  }

  /**
  * Closes the custom link provider menu
  * @param evt: the event that fired
  */
  handleCloseCustomLinkProviderAddMenu = () => {
    this.setState({
      customLinkProviderAddMenuAnchor: undefined
    })
  }

  /**
  * Adds a custom link example
  * @param evt: the event that fired
  * @param example: the example to add
  */
  handleAddCustomLinkExample = (evt, example) => {
    this.handleCloseCustomLinkProviderAddMenu()
    settingsActions.setCustomLinkProvider(undefined, example)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return partialShallowCompare(
      { showRestart: this.props.showRestart },
      this.state,
      { showRestart: nextProps.showRestart },
      nextState
    )
  }

  render () {
    const {
      // Don't use OS here. Extract out to state
      showRestart,
      classes,
      ...passProps
    } = this.props
    delete passProps.os
    const {
      openLinksInBackground,
      linkBehaviourWithShift,
      linkBehaviourWithCmdOrCtrl,
      customLinkProviderNames,
      customLinkProviderEditorOpen,
      customLinkProviderEditorId,
      customLinkProviderAddMenuAnchor
    } = this.state

    return (
      <React.Fragment>
        <SettingsListSection title='Links' icon={<LinkIcon />} {...passProps}>
          {process.platform === 'darwin' ? (
            <SettingsListItemSwitch
              label='Open links in background'
              onChange={(evt, toggled) => settingsActions.sub.os.setOpenLinksInBackground(toggled)}
              checked={openLinksInBackground} />
          ) : undefined}
          <SettingsListItemSelectInline
            label={`${process.platform === 'darwin' ? '⌘ Command' : '⌃ Control'}+Click link behaviour`}
            value={linkBehaviourWithCmdOrCtrl}
            options={LINK_OPEN_OPTIONS}
            onChange={(evt, value) => settingsActions.sub.os.setLinkBehaviourWithCmdOrCtrl(value)} />
          <SettingsListItemSelectInline
            label='⇧ Shift+Click link behaviour'
            value={linkBehaviourWithShift}
            options={LINK_OPEN_OPTIONS}
            onChange={(evt, value) => settingsActions.sub.os.setLinkBehaviourWithShift(value)} />
          <SettingsListItem className={classes.customLinkOpenerContainer}>
            <div className={classes.customLinkOpenerTitle}>
              <ListItemText
                primary='Custom link openers (Advanced)'
                secondary={DistributionConfig.isSnapInstall ? (
                  <SettingsListTypography type='info'>
                    This featue is currently unavailable with the Snap version of Wavebox
                  </SettingsListTypography>
                ) : undefined} />
              <Button
                className={classes.microButton}
                size='small'
                variant='outlined'
                disabled={DistributionConfig.isSnapInstall}
                onClick={this.handleOpenCustomLinkProviderAddMenu}>
                <AddIcon /> Add new
              </Button>
              <Menu
                disableAutoFocusItem
                disableEnforceFocus
                MenuListProps={{ dense: true }}
                anchorEl={customLinkProviderAddMenuAnchor}
                open={!!customLinkProviderAddMenuAnchor}
                onClose={this.handleCloseCustomLinkProviderAddMenu}>
                <MenuItem onClick={this.handleCreateNewCustomLinkProvider}>
                  Blank
                </MenuItem>
                <Divider />
                {CUSTOM_LINK_PROVIDER_EXAMPLES[process.platform].map((example, i) => {
                  return (
                    <MenuItem key={`${i}`} onClick={(evt) => this.handleAddCustomLinkExample(evt, example)}>
                      {`Example ${example.name}`}
                    </MenuItem>
                  )
                })}
              </Menu>
            </div>
            {Object.keys(customLinkProviderNames).length ? (
              <Paper className={classes.customLinkOpenerList}>
                <List disablePadding dense>
                  {Object.keys(customLinkProviderNames).map((id, i, arr) => {
                    return (
                      <ListItem
                        key={id}
                        button
                        divider={i !== arr.length - 1}
                        onClick={(evt) => this.handleEditCustomLinkProvider(evt, id)}>
                        <ListItemText primary={customLinkProviderNames[id]} />
                        <ListItemSecondaryAction>
                          <IconButton onClick={(evt) => this.handleEditCustomLinkProvider(evt, id)}>
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  })}
                </List>
              </Paper>
            ) : undefined}
          </SettingsListItem>
          <SettingsListItemText
            divider={false}
            primary='Each account also has its own unique set of link settings'
            primaryType='info'
            primaryIcon={(<InfoIcon />)}
            secondary={(
              <span
                className={classes.link}
                onClick={() => { window.location.hash = '/settings/accounts' }}>
                Account Settings
              </span>
            )} />
        </SettingsListSection>
        <Dialog
          disableEnforceFocus
          disableRestoreFocus
          open={customLinkProviderEditorOpen}
          onClose={this.handleCloseCustomLinkProviderEditor}>
          <CustomLinkProviderEditorDialogContent
            providerId={customLinkProviderEditorId}
            onRequestClose={this.handleCloseCustomLinkProviderEditor} />
        </Dialog>
      </React.Fragment>
    )
  }
}

export default LinkSettingsSection
