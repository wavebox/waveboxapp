import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, RaisedButton, FlatButton, CircularProgress } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import { crextensionStore, crextensionActions } from 'stores/crextension'

const { remote: {shell} } = window.nativeRequire('electron')

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
  actionsDeveloperRow: {
    marginBottom: 8
  },
  actionAfterRestart: {
    fontSize: '12px',
    color: Colors.grey600
  },
  actionDownload: {
    display: 'inline-block',
    fontSize: '12px',
    marginLeft: 8,
    marginTop: -8
  }
}

export default class ExtensionListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    extensionId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    iconUrl: PropTypes.string,
    websiteUrl: PropTypes.string,
    licenseUrl: PropTypes.string,
    remoteUrl: PropTypes.string,
    unknownSource: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    crextensionStore.listen(this.extensionUpdated)
  }

  componentWillUnmount () {
    crextensionStore.unlisten(this.extensionUpdated)
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
  */
  generateState (props, crextensionState = crextensionStore.getState()) {
    return {
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
      ...this.generateState(this.props, undefined)
    }
  })()

  extensionUpdated = (crextensionState) => {
    this.setState(this.generateState(this.props, crextensionState))
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the website
  */
  handleOpenWebsite = () => {
    shell.openExternal(this.props.websiteUrl)
  }

  /**
  * Opens the license
  */
  handleOpenLicense = () => {
    shell.openExternal(this.props.licenseUrl)
  }

  /**
  * Installs the extension
  */
  handleInstall = () => {
    crextensionActions.installExtension(this.props.extensionId, this.props.remoteUrl)
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
  * @param isWaitingInstall: true if it's waiting for an install
  * @param isWaitingUninstall: true if it's waiting for an uninstall
  * @param isInstalled: true if it's installed
  * @param isDownloading: true if this is downloading
  * @param hasBackgroundPage: true if this extension has a background page
  * @param hasOptionsPage: true if this extension has an options page
  * @return jsx
  */
  renderActions (isWaitingInstall, isWaitingUninstall, isDownloading, isInstalled, hasBackgroundPage, hasOptionsPage) {
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
          <CircularProgress size={20} thickness={3} />
          <span style={styles.actionDownload}>Downloading...</span>
        </div>
      )
    } else if (isInstalled) {
      return (
        <div style={styles.actions}>
          <div style={styles.actionsDeveloperRow}>
            {hasOptionsPage ? (
              <FlatButton
                onClick={this.handleOpenOptionsPage}
                label='Options' />
            ) : undefined}
            {hasBackgroundPage ? (
              <FlatButton
                onClick={this.handleInspectBackgroundPage}
                label='Inspect background page' />
            ) : undefined}
          </div>
          <RaisedButton
            onClick={this.handleUninstall}
            label='Uninstall' />
        </div>
      )
    } else {
      return (
        <div style={styles.actions}>
          <RaisedButton
            label='Install'
            onClick={this.handleInstall} />
        </div>
      )
    }
  }

  render () {
    const {
      showRestart,
      extensionId,
      name,
      description,
      iconUrl,
      websiteUrl,
      licenseUrl,
      remoteUrl,
      unknownSource,
      style,
      ...passProps
    } = this.props
    const {
      isWaitingInstall,
      isWaitingUninstall,
      isInstalled,
      isDownloading,
      hasBackgroundPage,
      hasOptionsPage
    } = this.state

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
            {this.renderActions(isWaitingInstall, isWaitingUninstall, isDownloading, isInstalled, hasBackgroundPage, hasOptionsPage)}
          </div>
        </div>
      </Paper>
    )
  }
}
