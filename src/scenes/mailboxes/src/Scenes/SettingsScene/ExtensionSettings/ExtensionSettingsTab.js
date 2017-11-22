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
import * as Colors from 'material-ui/styles/colors'

const EXTENSION_LAYOUT_MODE_LABELS = {
  [ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT]: 'Left',
  [ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT]: 'Right'
}

const styles = {
  tryOnBeta: {
    border: `2px solid ${Colors.lightBlue500}`,
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
    color: Colors.lightBlue500,
    fontSize: '14px'
  }
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
              <div style={styles.tryOnBeta}>
                <h3>Extension Support</h3>
                Extension support is currently experimental and all extensions are available to install until
                the end of November 2017. Thereafter those marked as Pro are only available to install with a
                Wavebox Pro membership
              </div>
            </Col>
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
