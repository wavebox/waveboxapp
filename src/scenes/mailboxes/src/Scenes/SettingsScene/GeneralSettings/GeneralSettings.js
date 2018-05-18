import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import settingsStore from 'stores/settings/settingsStore'
import platformStore from 'stores/platform/platformStore'
import UISettingsSection from './UISettingsSection'
import NotificationSettingsSection from './NotificationSettingsSection'
import DownloadSettingsSection from './DownloadSettingsSection'
import LanguageSettingsSection from './LanguageSettingsSection'
import PlatformSettingsSection from './PlatformSettingsSection'
import TraySettingsSection from './TraySettingsSection'
import UpdateSettingsSection from './UpdateSettingsSection'
import AcceleratorSettingsSection from './AcceleratorSettingsSection'
import DataSettingsSection from './DataSettingsSection'
import AdvancedSettingsSection from './AdvancedSettingsSection'
import DebugSettingsSection from './DebugSettingsSection'
import InfoSettingsSection from './InfoSettingsSection'
import shallowCompare from 'react-addons-shallow-compare'
import Scrollspy from 'react-scrollspy'
import { withStyles } from 'material-ui/styles'
import StyleMixins from 'wbui/Styles/StyleMixins'
import classNames from 'classnames'
import uuid from 'uuid'
import { List, ListItem, Paper } from 'material-ui'
import lightBlue from 'material-ui/colors/lightBlue'

const CONTENT_WIDTH = 600
const SCROLLSPY_WIDTH = 160

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden'
  },
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  scrollspy: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCROLLSPY_WIDTH
  },
  scrollspyList: {
    paddingTop: 0,
    paddingBottom: 0
  },
  scrollspyItem: {
    '&.is-current': {
      backgroundColor: lightBlue[600],
      color: 'white'
    }
  },
  [`@media (max-width: ${CONTENT_WIDTH + (2 * SCROLLSPY_WIDTH)}px)`]: {
    scroller: {
      left: SCROLLSPY_WIDTH
    }
  },
  [`@media (max-width: ${CONTENT_WIDTH + (SCROLLSPY_WIDTH)}px)`]: {
    scroller: {
      left: 0
    },
    scrollspy: {
      display: 'none'
    }
  }
}

@withStyles(styles)
class GeneralSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.sectionRefs = {}
    this.scrollerRef = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    platformStore.listen(this.platformChanged)
    this.instanceId = uuid.v4()

    this.belowFoldRenderTO = setTimeout(() => {
      this.setState({ renderBelowFold: true })
    }, 500)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    platformStore.unlisten(this.platformChanged)

    clearTimeout(this.belowFoldRenderTO)
  }

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
      app: store.app,
      os: store.os,
      extension: store.extension,
      language: store.language,
      tray: store.tray,
      accelerators: store.accelerators
    }
  }

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
  }

  state = {
    renderBelowFold: false,
    ...this.generateSettingsState(),
    ...this.generatePlatformState()
  }

  settingsChanged = (store) => {
    this.setState(this.generateSettingsState(store))
  }

  platformChanged = (store) => {
    this.setState(this.generatePlatformState(store))
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Scrolls to a section
  */
  scrollToSection = (evt, sectionName) => {
    if (this.sectionRefs[sectionName] && this.scrollerRef) {
      const target = ReactDOM.findDOMNode(this.sectionRefs[sectionName])
      ReactDOM.findDOMNode(this.scrollerRef).scrollTop = target.offsetTop
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      ui,
      os,
      app,
      language,
      extension,
      tray,
      accelerators,
      openAtLoginSupported,
      mailtoLinkHandlerSupported,
      isMailtoLinkHandler,
      renderBelowFold
    } = this.state
    const {showRestart, classes, className, ...passProps} = this.props

    return (
      <div
        id={`RC-GeneralSettings-${this.instanceId}`}
        className={classNames(classes.root, className)}
        {...passProps}>
        <div ref={(n) => { this.scrollerRef = n }} className={classes.scroller}>
          <section id='section-ui' ref={(n) => { this.sectionRefs['section-ui'] = n }}>
            <UISettingsSection ui={ui} os={os} accelerators={accelerators} extension={extension} showRestart={showRestart} />
          </section>
          <section id='section-notifications' ref={(n) => { this.sectionRefs['section-notifications'] = n }}>
            {renderBelowFold ? <NotificationSettingsSection os={os} /> : undefined}
          </section>
          <section id='section-download' ref={(n) => { this.sectionRefs['section-download'] = n }}>
            {renderBelowFold ? <DownloadSettingsSection os={os} /> : undefined}
          </section>
          <section id='section-language' ref={(n) => { this.sectionRefs['section-language'] = n }}>
            {renderBelowFold ? <LanguageSettingsSection language={language} showRestart={showRestart} /> : undefined}
          </section>
          <section id='section-platform' ref={(n) => { this.sectionRefs['section-platform'] = n }}>
            {renderBelowFold ? (
              <PlatformSettingsSection
                mailtoLinkHandlerSupported={mailtoLinkHandlerSupported}
                isMailtoLinkHandler={isMailtoLinkHandler}
                openAtLoginSupported={openAtLoginSupported} />
            ) : undefined}
          </section>
          <section id='section-tray' ref={(n) => { this.sectionRefs['section-tray'] = n }}>
            {renderBelowFold ? <TraySettingsSection tray={tray} showRestart={showRestart} /> : undefined}
          </section>
          <section id='section-accelerators' ref={(n) => { this.sectionRefs['section-accelerators'] = n }}>
            {renderBelowFold ? <AcceleratorSettingsSection accelerators={accelerators} /> : undefined}
          </section>
          <section id='section-update' ref={(n) => { this.sectionRefs['section-update'] = n }}>
            {renderBelowFold ? <UpdateSettingsSection app={app} showRestart={showRestart} /> : undefined}
          </section>
          <section id='section-data' ref={(n) => { this.sectionRefs['section-data'] = n }}>
            {renderBelowFold ? <DataSettingsSection showRestart={showRestart} /> : undefined}
          </section>
          <section id='section-advanced' ref={(n) => { this.sectionRefs['section-advanced'] = n }}>
            {renderBelowFold ? (
              <AdvancedSettingsSection
                showRestart={showRestart}
                app={app}
                extension={extension}
                language={language}
                ui={ui}
                tray={tray} />
            ) : undefined}
          </section>
          <section id='section-debug' ref={(n) => { this.sectionRefs['section-debug'] = n }}>
            {renderBelowFold ? <DebugSettingsSection app={app} showRestart={showRestart} /> : undefined}
          </section>
          <section id='section-about' ref={(n) => { this.sectionRefs['section-about'] = n }}>
            {renderBelowFold ? <InfoSettingsSection /> : undefined}
          </section>
        </div>
        <Paper className={classes.scrollspy}>
          <List dense className={classes.scrollspyList}>
            <Scrollspy
              rootEl={`#RC-GeneralSettings-${this.instanceId} .${classes.scroller}`}
              componentTag='div'
              items={[
                'section-ui',
                'section-notifications',
                'section-download',
                'section-language',
                'section-platform',
                'section-tray',
                'section-accelerators',
                'section-update',
                'section-data',
                'section-advanced',
                'section-debug',
                'section-about'
              ]}
              currentClassName='is-current'>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-ui')}>
                User Interface
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-notifications')}>
                Notifications
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-download')}>
                Download
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-language')}>
                Language
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-platform')}>
                Platform
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-tray')}>
                Tray
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-accelerators')}>
                Accelerators
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-update')}>
                Update
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-data')}>
                Data
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-advanced')}>
                Advanced
              </ListItem>
              <ListItem
                divider
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-debug')}>
                Debug
              </ListItem>
              <ListItem
                button
                className={classes.scrollspyItem}
                onClick={(evt) => this.scrollToSection(evt, 'section-about')}>
                About
              </ListItem>
            </Scrollspy>
          </List>
        </Paper>
      </div>
    )
  }
}

export default GeneralSettings
