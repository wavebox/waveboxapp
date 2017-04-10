const React = require('react')
const {
  Grid: { Container, Row, Col }
} = require('Components')
const settingsStore = require('stores/settings/settingsStore')
const platformStore = require('stores/platform/platformStore')

const DownloadSettingsSection = require('./DownloadSettingsSection')
const LanguageSettingsSection = require('./LanguageSettingsSection')
const NotificationSettingsSection = require('./NotificationSettingsSection')
const TraySettingsSection = require('./TraySettingsSection')
const UISettingsSection = require('./UISettingsSection')
const InfoSettingsSection = require('./InfoSettingsSection')
const PlatformSettingsSection = require('./PlatformSettingsSection')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GeneralSettings',
  propTypes: {
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    platformStore.listen(this.platformChanged)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    platformStore.unlisten(this.platformChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the settings state from the settings
  * @param store=settingsStore: the store to use
  */
  generateSettingsState (store = settingsStore.getState()) {
    return {
      ui: store.ui,
      os: store.os,
      language: store.language,
      tray: store.tray
    }
  },

  /**
  * Generates the platform state from the settings
  * @param store=platformStore: the store to use
  */
  generatePlatformState (store = platformStore.getState()) {
    return {
      openAtLoginSupported: store.loginPrefSupported(),
      mailtoLinkHandlerSupported: store.mailtoLinkHandlerSupported(),
      isMailtoLinkHandler: store.isMailtoLinkHandler()
    }
  },

  getInitialState () {
    return Object.assign({}, this.generateSettingsState(), this.generatePlatformState())
  },

  settingsChanged (store) {
    this.setState(this.generateSettingsState(store))
  },

  platformChanged (store) {
    this.setState(this.generatePlatformState(store))
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {
      ui,
      os,
      language,
      tray,
      openAtLoginSupported,
      mailtoLinkHandlerSupported,
      isMailtoLinkHandler
    } = this.state
    const {showRestart, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={6}>
              <UISettingsSection ui={ui} os={os} showRestart={showRestart} />
              <NotificationSettingsSection os={os} />
              <DownloadSettingsSection os={os} />
              <LanguageSettingsSection language={language} showRestart={showRestart} />
            </Col>
            <Col md={6}>
              <PlatformSettingsSection
                mailtoLinkHandlerSupported={mailtoLinkHandlerSupported}
                isMailtoLinkHandler={isMailtoLinkHandler}
                openAtLoginSupported={openAtLoginSupported} />
              <TraySettingsSection tray={tray} />
              <InfoSettingsSection />
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})
