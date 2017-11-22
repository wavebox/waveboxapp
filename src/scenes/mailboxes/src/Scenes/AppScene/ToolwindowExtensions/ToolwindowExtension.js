import React from 'react'
import PropTypes from 'prop-types'
import { extensionStore } from 'stores/extension'
import { settingsStore } from 'stores/settings'
import CoreExtensionManifest from 'shared/Models/Extensions/CoreExtensionManifest'
import WebView from 'sharedui/Components/WebView'
import { NotificationService } from 'Notifications'
import {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL
} from 'shared/extensionApis'
import {
  WB_BROWSER_START_SPELLCHECK,
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_NOTIFICATION_CLICK,
  WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import Resolver from 'Runtime/Resolver'

const BROWSER_REF = 'browser'

export default class ToolwindowExtension extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    position: PropTypes.oneOf(Object.keys(CoreExtensionManifest.TOOLWINDOW_POSITIONS)),
    installId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    extensionStore.listen(this.extensionUpdated)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    extensionStore.unlisten(this.extensionUpdated)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.installId !== nextProps.installId) {
      this.setState({
        extension: extensionStore.getState().getInstalled(nextProps.installId)
      })
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingState = settingsStore.getState()
    return {
      extension: extensionStore.getState().getInstalled(this.props.installId),
      language: settingState.language.spellcheckerLanguage,
      secondaryLanguage: settingState.language.secondarySpellcheckerLanguage
    }
  })()

  extensionUpdated = (extensionState) => {
    this.setState({
      extension: extensionState.getInstalled(this.props.installId)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState((prevState) => {
      const update = {
        language: settingsState.language
      }

      // Siphon setting changes down to the webview
      if (settingsState.language !== prevState.language) {
        const prevLanguage = prevState.language
        const nextLanguage = update.language
        if (prevLanguage.spellcheckerLanguage !== nextLanguage.spellcheckerLanguage || prevLanguage.secondarySpellcheckerLanguage !== nextLanguage.secondarySpellcheckerLanguage) {
          this.refs[BROWSER_REF].send(WB_BROWSER_START_SPELLCHECK, {
            language: nextLanguage.spellcheckerLanguage,
            secondaryLanguage: nextLanguage.secondarySpellcheckerLanguage
          })
        }
      }

      return update
    })
  }

  /* **************************************************************************/
  // Webview events
  /* **************************************************************************/

  handleIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_NOTIFICATION_PRESENT:
        NotificationService.processHTML5HostedExtensionNotification(
          evt.channel.notificationId,
          evt.channel.notification,
          (notificationId) => {
            this.refs[BROWSER_REF].send(WB_BROWSER_NOTIFICATION_CLICK, { notificationId: notificationId })
          }
        )
        break
    }
  }

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady = () => {
    const { language } = this.state

    // Language
    if (language.spellcheckerEnabled) {
      this.refs[BROWSER_REF].send(WB_BROWSER_START_SPELLCHECK, {
        language: language.spellcheckerLanguage,
        secondaryLanguage: language.secondarySpellcheckerLanguage
      })
    }
  }

  /**
  * Handles the webcontents being attached
  * @param webContents: the webcontents that were attached
  */
  handleWebContentsAttached = (webContents) => {
    ipcRenderer.send(WB_MAILBOXES_WINDOW_EXTENSION_WEBVIEW_ATTACHED, {
      webContentsId: webContents.id,
      extensionId: this.props.extensionId
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the positional styling
  * @param position: the position
  * @param size: the size of the extension
  * @return a style object for this position
  */
  renderPositionalStyling (position, size) {
    switch (position) {
      case CoreExtensionManifest.TOOLWINDOW_POSITIONS.BOTTOM:
        return { height: size, width: '100%' }
      case CoreExtensionManifest.TOOLWINDOW_POSITIONS.SIDEBAR_O:
        return { width: size, height: '100%' }
      default: return {}
    }
  }

  render () {
    const { position, installId, style, ...passProps } = this.props
    const { extension } = this.state
    if (!extension) { return false }

    const { manifest, installTime } = extension
    const { toolwindowSize, toolwindowIndex } = manifest

    return (
      <div style={{
        ...style,
        position: 'relative',
        ...this.renderPositionalStyling(position, toolwindowSize)
      }} {...passProps}>
        <WebView
          ref={BROWSER_REF}
          key={installTime}
          preload={Resolver.guestPreload('hostedExtension')}
          src={`${WAVEBOX_HOSTED_EXTENSION_PROTOCOL}://${installId}/${toolwindowIndex}`}
          partition={'persist:' + installId}
          webpreferences={'contextIsolation=yes, nativeWindowOpen=yes'}
          allowpopups
          plugins
          onWebContentsAttached={this.handleWebContentsAttached}
          ipcMessage={this.handleIPCMessage}
          domReady={this.handleBrowserDomReady} />
      </div>
    )
  }
}
