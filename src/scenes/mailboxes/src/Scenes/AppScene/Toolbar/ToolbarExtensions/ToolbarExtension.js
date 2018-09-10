import PropTypes from 'prop-types'
import React from 'react'
import { crextensionStore, crextensionActions } from 'stores/crextension'
import shallowCompare from 'react-addons-shallow-compare'
import ToolbarExtensionAction from 'wbui/ToolbarExtensionAction'
import ToolbarExtensionActionContextMenu from 'wbui/ToolbarExtensionActionContextMenu'
import electron from 'electron'

export default class ToolbarExtension extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tabId: PropTypes.number,
    extensionId: PropTypes.string.isRequired,
    toolbarHeight: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    crextensionStore.listen(this.crextensionUpdated)
  }

  componentWillUnmount () {
    crextensionStore.unlisten(this.crextensionUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.tabId !== nextProps.tabId || this.props.extensionId !== nextProps.extensionId) {
      this.setState(this.generateExtensionState(nextProps.extensionId, nextProps.tabId, undefined))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the extension state
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab
  * @param crextensionState=autoget: the current extension state
  * @return state update for the given params
  */
  generateExtensionState (extensionId, tabId, crextensionState = crextensionStore.getState()) {
    const manifest = crextensionState.getManifest(extensionId)
    const browserAction = crextensionState.composedBrowserAction(extensionId, tabId)
    return {
      manifest: manifest,
      // Browser action may not be the same object as it's composed. So extract the required values
      browserActionEnabled: browserAction.enabled,
      browserActionIcon: browserAction.icon,
      browserActionTitle: browserAction.title
    }
  }

  state = (() => {
    return {
      contextMenuOpen: false,
      contextMenuAnchor: null,
      ...this.generateExtensionState(this.props.extensionId, this.props.tabId, undefined)
    }
  })()

  crextensionUpdated = (crextensionState) => {
    this.setState(this.generateExtensionState(this.props.extensionId, this.props.tabId, crextensionState))
  }

  /* **************************************************************************/
  // Event handlers: Context menus
  /* **************************************************************************/

  handleOpenContextMenu = (evt) => {
    this.setState({ contextMenuOpen: true, contextMenuAnchor: evt.target })
  }

  handleCloseContextMenu = () => {
    this.setState({ contextMenuOpen: false })
  }

  /* **************************************************************************/
  // Event handlers: actions
  /* **************************************************************************/

  /**
  * Handles the browser action being clicked
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab
  */
  handleIconClicked = (evt, extensionId, tabId) => {
    crextensionActions.browserActionClicked(extensionId, tabId)
  }

  /**
  * Handles the browser action being clicked
  * @param itemType: the type of item that was clicked
  * @param extensionId: the id of the extension
  * @param tabId: the id of the tab
  */
  handleContextMenuItemSelected = (itemType, extensionId, tabId) => {
    switch (itemType) {
      case ToolbarExtensionActionContextMenu.ITEM_TYPES.MANAGE:
        window.location.hash = `/settings/extensions`
        break
      case ToolbarExtensionActionContextMenu.ITEM_TYPES.HOMEPAGE:
        electron.remote.shell.openExternal(this.state.manifest.homepageUrl)
        break
      case ToolbarExtensionActionContextMenu.ITEM_TYPES.OPTIONS:
        crextensionActions.openExtensionOptions(extensionId)
        break
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
      tabId,
      extensionId,
      toolbarHeight
    } = this.props
    const {
      contextMenuOpen,
      contextMenuAnchor,
      browserActionEnabled,
      browserActionIcon,
      browserActionTitle,
      manifest
    } = this.state

    return (
      <div>
        <ToolbarExtensionAction
          toolbarHeight={toolbarHeight}
          extensionId={extensionId}
          tabId={tabId}
          enabled={browserActionEnabled}
          icon={browserActionIcon}
          iconFilter={manifest.wavebox.browserActionIconFilter}
          title={browserActionTitle}
          onIconClicked={this.handleIconClicked}
          onContextMenu={this.handleOpenContextMenu} />
        <ToolbarExtensionActionContextMenu
          open={contextMenuOpen}
          anchor={contextMenuAnchor}
          name={manifest.name}
          extensionId={extensionId}
          hasHomepageUrl={manifest.hasHomepageUrl}
          hasOptions={manifest.hasOptionsPage}
          onRequestClose={this.handleCloseContextMenu}
          onItemSelected={this.handleContextMenuItemSelected} />
      </div>
    )
  }
}
