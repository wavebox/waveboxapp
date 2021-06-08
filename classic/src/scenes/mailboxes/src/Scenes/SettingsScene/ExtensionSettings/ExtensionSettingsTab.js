import PropTypes from 'prop-types'
import React from 'react'
import { settingsStore, settingsActions } from 'stores/settings'
import { userActions } from 'stores/user'
import { crextensionActions } from 'stores/crextension'
import shallowCompare from 'react-addons-shallow-compare'
import { ExtensionSettings } from 'shared/Models/Settings'
import ExtensionList from './ExtensionList'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListContainer from 'wbui/SettingsListContainer'
import FileUploadButton from 'wbui/FileUploadButton'
import SettingsListTypography from 'wbui/SettingsListTypography'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  unpackedListItem: {
    display: 'block'
  }
}

@withStyles(styles)
class ExtensionSettingsTab extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      extension: settingsState.extension,
      hasInstalledUnpacked: false
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      extension: settingsState.extension
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      extension,
      hasInstalledUnpacked
    } = this.state
    const {
      showRestart,
      classes,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <SettingsListSection title='Extension Settings' {...passProps}>
          <SettingsListItemSwitch
            label='Show extensions in toolbar'
            onChange={(evt, toggled) => { settingsActions.sub.extension.setShowBrowserActionsInToolbar(toggled) }}
            checked={extension.showBrowserActionsInToolbar} />
          <SettingsListItemSelectInline
            label='Extension position in toolbar'
            value={extension.toolbarBrowserActionLayout}
            disabled={!extension.showBrowserActionsInToolbar}
            options={[
              { value: ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT, label: 'Left' },
              { value: ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT, label: 'Right' }
            ]}
            onChange={(evt, value) => { settingsActions.sub.extension.setToolbarBrowserActionLayout(value) }} />
          <SettingsListItemSwitch
            label='Developer tools'
            onChange={(evt, toggled) => { settingsActions.sub.extension.setShowDeveloperTools(toggled) }}
            checked={extension.showDeveloperTools} />
          {extension.showDeveloperTools ? (
            <SettingsListItem className={classes.unpackedListItem}>
              <FileUploadButton
                size='small'
                variant='contained'
                webkitdirectory='webkitdirectory'
                onChange={(evt) => {
                  if (evt.target && evt.target.files && evt.target.files[0]) {
                    crextensionActions.installUnpackedExtension(evt.target.files[0].path)
                    this.setState({ hasInstalledUnpacked: true })
                    showRestart()
                  }
                }}>
                Install unpacked extension
              </FileUploadButton>
              {hasInstalledUnpacked ? (
                <SettingsListTypography variant='button-help' type='muted'>
                  Restart Wavebox to complete the install
                </SettingsListTypography>
              ) : undefined}
            </SettingsListItem>
          ) : undefined}
          <SettingsListItem divider={false}>
            <Button variant='contained' size='small' onClick={() => userActions.updateExtensions()}>
              Check for updates
            </Button>
          </SettingsListItem>
        </SettingsListSection>
        <SettingsListContainer>
          <ExtensionList showRestart={showRestart} />
        </SettingsListContainer>
      </div>
    )
  }
}

export default ExtensionSettingsTab
