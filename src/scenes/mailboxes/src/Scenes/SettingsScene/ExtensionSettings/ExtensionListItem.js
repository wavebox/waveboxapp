import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, Button } from '@material-ui/core'
import Spinner from 'wbui/Activity/Spinner'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import grey from '@material-ui/core/colors/grey'
import lightBlue from '@material-ui/core/colors/lightBlue'
import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import KRXFramework from 'Runtime/KRXFramework'

const styles = {
  // Layout
  paperContainer: {
    padding: 0,
    margin: '16px 0px'
  },
  contentContainer: {
    position: 'relative',
    margin: 8,
    minHeight: 115
  },
  leftColumn: {
    position: 'absolute',
    width: 80,
    height: '100%',
    left: 0,
    top: 0,
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 8
  },
  rightColumn: {
    marginLeft: 80,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8
  },

  // Info
  icon: {
    display: 'block',
    margin: '0px auto',
    width: 60,
    height: 60,
    backgroundSize: 'contain',
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat'
  },
  name: {
    fontSize: '14px',
    fontWeight: 500,
    margin: 0
  },
  version: {
    fontSize: '13px',
    color: grey[600],
    fontWeight: 300
  },
  description: {
    fontSize: '13px',
    color: grey[400],
    marginTop: 0,
    marginBottom: 0
  },
  onProLevel: {
    border: `2px solid ${lightBlue[500]}`,
    borderRadius: 4,
    display: 'inline-block',
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
    color: lightBlue[500],
    fontSize: '14px'
  },
  unknownSource: {
    fontSize: '13px',
    color: red[400]
  },
  link: {
    textDecoration: 'underline',
    fontSize: '12px',
    color: blue[600],
    cursor: 'pointer'
  },
  linkSeparator: {
    fontSize: '12px',
    color: grey[600]
  },

  // Actions
  actions: {
    marginTop: 8
  },
  actionAfterRestart: {
    display: 'block',
    fontSize: '12px',
    color: grey[600]
  },
  actionDownload: {
    display: 'inline-block',
    fontSize: '12px',
    marginLeft: 8,
    lineHeight: '20px'
  },
  actionSpinner: {
    display: 'inline-flex',
    verticalAlign: 'middle'
  },
  action: {
    marginRight: 8
  },
  developerAction: {
    color: grey[600],
    textDecoration: 'underline'
  }
}

@withStyles(styles)
class ExtensionListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    extensionId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    settingsStore.listen(this.settingsUpdated)
    KRXFramework.on(`extension-entry-changed-${this.props.extensionId}`, this.extensionChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    settingsStore.unlisten(this.settingsUpdated)
    KRXFramework.removeListener(`extension-entry-changed-${this.props.extensionId}`, this.extensionChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.extensionId !== nextProps.extensionId) {
      this.setState(this.generateState(nextProps, undefined))
      KRXFramework.removeListener(`extension-entry-changed-${this.props.extensionId}`, this.extensionChanged)
      KRXFramework.on(`extension-entry-changed-${nextProps.extensionId}`, this.extensionChanged)
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the extension state
  * @param props: the props to to generate from
  * @param crextensionState=autoget: the store state
  * @param userState=autoget: the store state
  * @return a state update
  */
  generateState (props, userState = userStore.getState()) {
    const manifest = KRXFramework.getManifest(props.extensionId)
    const storeRec = userState.getExtension(props.extensionId)
    return {
      unknownSource: true,
      availableToUser: true,
      ...(manifest ? {
        unknownSource: true,
        availableToUser: true
      } : undefined),
      ...(storeRec ? {
        ...storeRec,
        version: undefined,
        unknownSource: false,
        availableToUser: userState.user.hasExtensionWithLevel(storeRec.availableTo)
      } : undefined),
      ...(manifest ? {
        name: manifest.name,
        description: manifest.description,
        websiteUrl: manifest.homepageUrl,
        version: manifest.version,
        waveboxVersion: manifest.wavebox.version
      } : undefined),
      isWaitingInstall: KRXFramework.isWaitingInstall(props.extensionId),
      isWaitingUninstall: KRXFramework.isWaitingUninstall(props.extensionId),
      isInstalled: KRXFramework.isInstalled(props.extensionId),
      isDownloading: KRXFramework.isDownloading(props.extensionId),
      isWaitingUpdate: KRXFramework.isWaitingUpdate(props.extensionId),
      isCheckingUpdate: KRXFramework.isCheckingUpdate(props.extensionId),
      hasBackgroundPage: KRXFramework.hasBackgroundPage(props.extensionId),
      hasOptionsPage: KRXFramework.hasOptionsPage(props.extensionId)
    }
  }

  state = (() => {
    return {
      showDeveloperTools: settingsStore.getState().extension.showDeveloperTools,
      ...this.generateState(this.props, undefined)
    }
  })()

  userUpdated = (userState) => {
    this.setState(this.generateState(this.props, userState))
  }

  extensionChanged = () => {
    this.setState(this.generateState(this.props, undefined))
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      showDeveloperTools: settingsState.extension.showDeveloperTools
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the website
  */
  handleOpenWebsite = () => {
    WBRPCRenderer.wavebox.openExternal(this.state.websiteUrl)
  }

  /**
  * Opens the license
  */
  handleOpenLicense = () => {
    WBRPCRenderer.wavebox.openExternal(this.state.licenseUrl)
  }

  /**
  * Installs the extension
  */
  handleInstall = () => {
    KRXFramework.installExtension(this.props.extensionId)
    this.props.showRestart()
  }

  /**
  * Uninstalls the extension
  */
  handleUninstall = () => {
    KRXFramework.uninstallExtension(this.props.extensionId)
    this.props.showRestart()
  }

  /**
  * Opens the options page for the extension
  */
  handleOpenOptionsPage = () => {
    KRXFramework.openOptions(this.props.extensionId)
  }

  /**
  * Opens the background page inspector for the extension
  */
  handleInspectBackgroundPage = () => {
    KRXFramework.inspectBackground(this.props.extensionId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the actions
  * @param classes:
  * @param state: the state to use to render
  * @return jsx
  */
  renderInstalledActions (classes, state) {
    const {
      hasBackgroundPage,
      hasOptionsPage,
      availableToUser,
      showDeveloperTools
    } = state
    if (availableToUser) {
      return (
        <div className={classes.actions}>
          <Button
            variant='contained'
            size='small'
            onClick={this.handleUninstall}
            className={classes.action}>
            Uninstall
          </Button>
          {hasOptionsPage ? (
            <Button
              variant='contained'
              size='small'
              onClick={this.handleOpenOptionsPage}
              className={classes.action}>
              Options
            </Button>
          ) : undefined}
          {showDeveloperTools ? (
            <div>
              {hasBackgroundPage ? (
                <Button
                  size='small'
                  onClick={this.handleInspectBackgroundPage}
                  className={classNames(classes.action, classes.developerAction)}>
                  Inspect background page
                </Button>
              ) : undefined}
            </div>
          ) : undefined}
        </div>
      )
    } else {
      return (
        <div className={classes.actions}>
          <Button
            variant='contained'
            size='small' onClick={this.handleUninstall}
            className={classes.action}>
            Uninstall
          </Button>
        </div>
      )
    }
  }

  /**
  * Renders the actions
  * @param classes:
  * @param state: the state to use to render
  * @return jsx
  */
  renderActions (classes, state) {
    const {
      isWaitingInstall,
      isWaitingUninstall,
      isDownloading,
      isInstalled,
      isWaitingUpdate,
      isCheckingUpdate,
      availableToUser
    } = state

    if (isWaitingInstall) {
      return (
        <div className={classes.actions}>
          <span className={classes.actionAfterRestart}>Install will complete after restart</span>
        </div>
      )
    } else if (isWaitingUninstall) {
      return (
        <div className={classes.actions}>
          <span className={classes.actionAfterRestart}>Uninstall will complete after restart</span>
        </div>
      )
    } else if (isDownloading) {
      return (
        <div className={classes.actions}>
          <div className={classes.actionSpinner}>
            <Spinner size={12} color={lightBlue[600]} />
          </div>
          <span className={classes.actionDownload}>Downloading...</span>
        </div>
      )
    } else if (isWaitingUpdate) {
      return (
        <div className={classes.actions}>
          <span className={classes.actionAfterRestart}>Update will complete after restart</span>
          {this.renderInstalledActions(classes, state)}
        </div>
      )
    } else if (isCheckingUpdate) {
      return (
        <div className={classes.actions}>
          <div className={classes.actionSpinner}>
            <Spinner size={12} color={lightBlue[600]} />
          </div>
          <span className={classes.actionDownload}>Checking for updates...</span>
        </div>
      )
    } else if (isInstalled) {
      return this.renderInstalledActions(classes, state)
    } else if (availableToUser) {
      return (
        <div className={classes.actions}>
          <Button
            variant='contained'
            size='small' color='primary'
            onClick={this.handleInstall}>
            Install
          </Button>
        </div>
      )
    }
  }

  render () {
    const {
      showRestart,
      extensionId,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      name,
      description,
      version,
      waveboxVersion,
      iconUrl,
      websiteUrl,
      licenseUrl,
      availableTo,
      unknownSource
    } = this.state

    const onProLevel = (availableTo || []).findIndex((l) => l === 'pro') !== -1

    return (
      <Paper className={classNames(className, classes.paperContainer)} {...passProps}>
        <div className={classes.contentContainer}>
          <div className={classes.leftColumn}>
            <div className={classes.icon} style={{ backgroundImage: `url("${iconUrl}")` }} />
            {onProLevel ? (
              <div className={classes.onProLevel}>
                Pro
              </div>
            ) : undefined}
          </div>
          <div className={classes.rightColumn}>
            <div className={classes.info}>
              <h2 className={classes.name}>
                {name}
                {version !== undefined || waveboxVersion !== undefined ? (
                  <span className={classes.version}>
                    {` ${version || '0'}-${waveboxVersion || '0'}`}
                  </span>
                ) : undefined}
              </h2>
              <p className={classes.description}>{description}</p>
              {unknownSource ? (
                <div className={classes.unknownSource}>Installed from an unknown source</div>
              ) : undefined}
              <div>
                {websiteUrl ? (
                  <span className={classes.link} onClick={this.handleOpenWebsite}>Website</span>
                ) : undefined}
                {websiteUrl && licenseUrl ? (<span className={classes.linkSeparator}> | </span>) : undefined}
                {licenseUrl ? (
                  <span className={classes.link} onClick={this.handleOpenLicense}>License</span>
                ) : undefined}
              </div>
            </div>
            {this.renderActions(classes, this.state)}
          </div>
        </div>
      </Paper>
    )
  }
}

export default ExtensionListItem
