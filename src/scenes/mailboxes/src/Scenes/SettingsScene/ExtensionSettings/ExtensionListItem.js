import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, RaisedButton, FlatButton, CircularProgress } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import { crextensionStore, crextensionActions } from 'stores/crextension'
import { userStore } from 'stores/user'
import electron from 'electron'

const styles = {
  // Layout
  paperContainer: {
    padding: '16px 8px',
    margin: '16px 0px'
  },
  contentContainer: {
    position: 'relative',
    margin: 8
  },
  leftColumn: {
    position: 'absolute',
    width: 80,
    height: '100%',
    left: 0,
    top: 0,
    backgroundSize: '60px',
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat'
  },
  rightColumn: {
    marginLeft: 80
  },

  // Info
  name: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: 0
  },
  description: {
    fontSize: '13px',
    color: Colors.grey400,
    marginTop: 0,
    marginBottom: 0
  },
  tryOnBeta: {
    border: `2px solid ${Colors.lightBlue500}`,
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
    color: Colors.lightBlue500,
    fontSize: '14px'
  },
  unknownSource: {
    fontSize: '13px',
    color: Colors.red400
  },
  link: {
    textDecoration: 'underline',
    fontSize: '12px',
    color: Colors.blue600,
    cursor: 'pointer'
  },
  linkSeperator: {
    fontSize: '12px',
    color: Colors.grey600
  },

  // Actions
  actions: {
    marginTop: 8
  },
  actionAfterRestart: {
    fontSize: '12px',
    color: Colors.grey600
  },
  actionDownload: {
    display: 'inline-block',
    fontSize: '12px',
    marginLeft: 8,
    lineHeight: '20px'
  },
  actionSpinner: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  action: {
    marginRight: 8
  },
  developerAction: {
    color: Colors.grey600,
    textDecoration: 'underline'
  }
}

export default class ExtensionListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    extensionId: PropTypes.string.isRequired,
    showBetaTrial: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    crextensionStore.listen(this.extensionUpdated)
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    crextensionStore.unlisten(this.extensionUpdated)
    userStore.unlisten(this.userUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.extensionId !== nextProps.extensionId) {
      this.setState(this.generateState(nextProps, undefined))
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
  generateState (props, crextensionState = crextensionStore.getState(), userState = userStore.getState()) {
    const manifest = crextensionState.getManifest(props.extensionId)
    const storeRec = userState.getExtension(props.extensionId)

    return {
      unknownSource: true,
      availableToUser: true,
      ...(manifest ? {
        name: manifest.name,
        description: manifest.description,
        websiteUrl: manifest.homepageUrl,
        unknownSource: true,
        availableToUser: true
      } : undefined),
      ...(storeRec ? {
        ...storeRec,
        unknownSource: false,
        availableToUser: userState.user.hasExtensionWithLevel(storeRec.availableTo)
      } : undefined),
      isWaitingInstall: crextensionState.isWaitingInstall(props.extensionId),
      isWaitingUninstall: crextensionState.isWaitingUninstall(props.extensionId),
      isInstalled: crextensionState.isInstalled(props.extensionId),
      isDownloading: crextensionState.isDownloading(props.extensionId),
      hasBackgroundPage: crextensionState.hasBackgroundPage(props.extensionId),
      hasOptionsPage: crextensionState.hasOptionsPage(props.extensionId)
    }
  }

  state = (() => {
    return {
      ...this.generateState(this.props, undefined, undefined)
    }
  })()

  extensionUpdated = (crextensionState) => {
    this.setState(this.generateState(this.props, crextensionState, undefined))
  }

  userUpdated = (userState) => {
    this.setState(this.generateState(this.props, undefined, userState))
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the website
  */
  handleOpenWebsite = () => {
    electron.remote.shell.openExternal(this.state.websiteUrl)
  }

  /**
  * Opens the license
  */
  handleOpenLicense = () => {
    electron.remote.shell.openExternal(this.state.licenseUrl)
  }

  /**
  * Installs the extension
  */
  handleInstall = () => {
    crextensionActions.installExtension(this.props.extensionId, this.state.install)
    this.props.showRestart()
  }

  /**
  * Uninstalls the extension
  */
  handleUninstall = () => {
    crextensionActions.uninstallExtension(this.props.extensionId)
    this.props.showRestart()
  }

  /**
  * Opens the options page for the extension
  */
  handleOpenOptionsPage = () => {
    crextensionActions.openExtensionOptions(this.props.extensionId)
  }

  /**
  * Opens the background page inspector for the extension
  */
  handleInspectBackgroundPage = () => {
    crextensionActions.inspectBackgroundPage(this.props.extensionId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the actions
  * @param state: the state to use to render
  * @return jsx
  */
  renderActions (state) {
    const {
      isWaitingInstall,
      isWaitingUninstall,
      isDownloading,
      isInstalled,
      hasBackgroundPage,
      hasOptionsPage,
      availableToUser
    } = state

    if (isWaitingInstall) {
      return (
        <div style={styles.actions}>
          <span style={styles.actionAfterRestart}>Install will complete after restart</span>
        </div>
      )
    } else if (isWaitingUninstall) {
      return (
        <div style={styles.actions}>
          <span style={styles.actionAfterRestart}>Uninstall will complete after restart</span>
        </div>
      )
    } else if (isDownloading) {
      return (
        <div style={styles.actions}>
          <CircularProgress size={20} thickness={3} style={styles.actionSpinner} />
          <span style={styles.actionDownload}>Downloading...</span>
        </div>
      )
    } else if (isInstalled) {
      if (availableToUser) {
        return (
          <div style={styles.actions}>
            <RaisedButton
              onClick={this.handleUninstall}
              style={styles.action}
              label='Uninstall' />
            {hasOptionsPage ? (
              <RaisedButton
                onClick={this.handleOpenOptionsPage}
                style={styles.action}
                label='Options' />
            ) : undefined}
            {hasBackgroundPage ? (
              <FlatButton
                onClick={this.handleInspectBackgroundPage}
                style={styles.action}
                labelStyle={styles.developerAction}
                label='Inspect background page' />
            ) : undefined}
          </div>
        )
      } else {
        return (
          <div style={styles.actions}>
            <RaisedButton
              onClick={this.handleUninstall}
              style={styles.action}
              label='Uninstall' />
          </div>
        )
      }
    } else if (availableToUser) {
      return (
        <div style={styles.actions}>
          <RaisedButton
            label='Install'
            primary
            onClick={this.handleInstall} />
        </div>
      )
    }
  }

  render () {
    const {
      showRestart,
      extensionId,
      showBetaTrial,
      style,
      ...passProps
    } = this.props
    const {
      name,
      description,
      iconUrl,
      websiteUrl,
      licenseUrl,
      availableTo,
      unknownSource
    } = this.state

    const onProLevel = (availableTo || []).findIndex((l) => l === 'pro') !== -1

    return (
      <Paper {...passProps} style={{...styles.paperContainer, ...style}}>
        <div style={styles.contentContainer}>
          <div style={{ ...styles.leftColumn, backgroundImage: `url("${iconUrl}")` }} />
          <div style={styles.rightColumn}>
            <div style={styles.info}>
              <h2 style={styles.name}>{name}</h2>
              <p style={styles.description}>{description}</p>
              {unknownSource ? (
                <div style={styles.unknownSource}>Installed from an unknown source</div>
              ) : undefined}
              {showBetaTrial && onProLevel ? (
                <div style={styles.tryOnBeta}>
                  This extension is free to try with basic accounts on the beta channel until the end of November 2017. Thereafter it will be available with Wavebox Pro
                </div>
              ) : undefined}
              <div>
                {websiteUrl ? (
                  <span style={styles.link} onClick={this.handleOpenWebsite}>Website</span>
                ) : undefined}
                {websiteUrl && licenseUrl ? (<span style={styles.linkSeperator}> | </span>) : undefined}
                {licenseUrl ? (
                  <span style={styles.link} onClick={this.handleOpenLicense}>License</span>
                ) : undefined}
              </div>
            </div>
            {this.renderActions(this.state)}
          </div>
        </div>
      </Paper>
    )
  }
}
