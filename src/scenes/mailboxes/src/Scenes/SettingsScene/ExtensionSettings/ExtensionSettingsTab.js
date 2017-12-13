import PropTypes from 'prop-types'
import React from 'react'
import { settingsStore, settingsActions } from 'stores/settings'
import { userActions } from 'stores/user'
import { Toggle, Paper, SelectField, MenuItem, RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import commonStyles from '../CommonSettingStyles'
import { Container, Row, Col } from 'Components/Grid'
import { ExtensionSettings } from 'shared/Models/Settings'
import ExtensionList from './ExtensionList'

const EXTENSION_LAYOUT_MODE_LABELS = {
  [ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT]: 'Left',
  [ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT]: 'Right'
}

export default class ExtensionSettingsTab extends React.Component {
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
      extension: settingsState.extension
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
      extension
    } = this.state
    const {showRestart, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={6}>
              <Paper zDepth={1} style={commonStyles.paper}>
                <Toggle
                  toggled={extension.showBrowserActionsInToolbar}
                  label='Show extensions in toolbar'
                  labelPosition='right'
                  onToggle={(evt, toggled) => settingsActions.setExtensionShowBrowserActionsInToolbar(toggled)} />
                <SelectField
                  floatingLabelText='Extension position in toolbar'
                  value={extension.toolbarBrowserActionLayout}
                  disabled={!extension.showBrowserActionsInToolbar}
                  fullWidth
                  onChange={(evt, index, value) => { settingsActions.setExtensionToolbarBrowserActionLayout(value) }}>
                  {Object.keys(ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT).map((value) => {
                    return (
                      <MenuItem
                        key={value}
                        value={value}
                        primaryText={EXTENSION_LAYOUT_MODE_LABELS[value]} />
                    )
                  })}
                </SelectField>
                <RaisedButton
                  label='Check for updates'
                  onClick={() => { userActions.updateExtensions() }} />
              </Paper>
            </Col>
          </Row>
          <ExtensionList showRestart={showRestart} />
        </Container>
      </div>
    )
  }
}
