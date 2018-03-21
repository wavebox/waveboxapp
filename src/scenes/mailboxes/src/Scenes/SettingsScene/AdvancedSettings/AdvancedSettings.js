import PropTypes from 'prop-types'
import React from 'react'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import AcceleratorSettings from './AcceleratorSettings'
import { Row, Col } from 'Components/Grid'
import AdvancedSettingsSection from './AdvancedSettingsSection'
import DataSettingsSection from './DataSettingsSection'
import UpdateSettingsSection from './UpdateSettingsSection'
import DebugSettingsSection from './DebugSettingsSection'

export default class AdvancedSettings extends React.Component {
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

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState (settingsState = settingsStore.getState()) {
    return {
      app: settingsState.app,
      tray: settingsState.tray,
      ui: settingsState.ui,
      language: settingsState.language,
      extension: settingsState.extension,
      accelerators: settingsState.accelerators
    }
  }

  state = (() => {
    return this.generateState()
  })()

  settingsChanged = (store) => {
    this.setState(this.generateState(store))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { app, accelerators, language, extension, tray, ui } = this.state
    const { showRestart, ...passProps } = this.props

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <AdvancedSettingsSection showRestart={showRestart} app={app} extension={extension} ui={ui} tray={tray} language={language} />
            <DataSettingsSection showRestart={showRestart} />
          </Col>
          <Col md={6}>
            <UpdateSettingsSection showRestart={showRestart} app={app} />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <AcceleratorSettings accelerators={accelerators} />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <DebugSettingsSection showRestart={showRestart} app={app} />
          </Col>
        </Row>
      </div>
    )
  }
}
