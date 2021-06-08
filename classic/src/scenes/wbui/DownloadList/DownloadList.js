import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { List, ListItem, Menu, MenuItem, ListItemText } from '@material-ui/core'
import DownloadListItem from './DownloadListItem'
import Download from 'shared/Models/LocalHistory/Download'

class DownloadList extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    downloads: PropTypes.array.isRequired,
    onClearAllDownloads: PropTypes.func.isRequired,
    onClearDownload: PropTypes.func.isRequired,
    onCancelDownload: PropTypes.func.isRequired,
    onOpenContainingFolder: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    contextMenu: null
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles opening the context menu
  * @param evt: the event that fired
  * @param downloadItem: the download item
  */
  handleOpenExtraOptions = (evt, downloadItem) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState({
      contextMenu: {
        anchor: evt.target,
        anchorPosition: { top: evt.clientY, left: evt.clientX },
        id: downloadItem.id,
        isActive: downloadItem.state === Download.STATES.ACTIVE
      }
    })
  }

  /**
  * Handles closing the context menu
  * @param evt: the event that fired
  */
  handleCloseContextMenu = (evt) => {
    this.setState({ contextMenu: null })
  }

  /**
  * Clears all downloads from the context menu
  * @param evt: the event that fired
  */
  handleContextMenuClearAllDownloads = (evt) => {
    this.props.onClearAllDownloads()
    this.handleCloseContextMenu(evt)
  }

  /**
  * Clears the currently active download from the context menu
  * @param evt: the event that fired
  */
  handleContextMenuClearDownload = (evt) => {
    this.props.onClearDownload(this.state.contextMenu.id)
    this.handleCloseContextMenu(evt)
  }

  /**
  * Cancels the currently active download from the context menu
  * @param evt: the event that fired
  */
  handleContextMenuCancelDownload = (evt) => {
    this.props.onCancelDownload(this.state.contextMenu.id)
    this.handleCloseContextMenu(evt)
  }

  /**
  * Handles clearing a failed download
  * @param evt: the event that fired
  * @param downloadItem: the download item
  */
  handleClearFailedDownload = (evt, downloadItem) => {
    this.props.onClearDownload(downloadItem.id)
  }

  /**
  * Handles opening a download folder
  * @param evt: the event that fired
  * @param downloadItem: the download item
  */
  handleOpeningContainingFolder = (evt, downloadItem) => {
    this.props.onOpenContainingFolder(downloadItem.id)
  }

  /**
  * Handles cancelling an active download
  * @param evt: the event that fired
  * @param downloadItem: the download item
  */
  handleCancelActiveDownload = (evt, downloadItem) => {
    this.props.onCancelDownload(downloadItem.id)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      downloads,
      onClearAllDownloads,
      onClearDownload,
      onCancelDownload,
      onOpenContainingFolder,
      ...passProps
    } = this.props
    const {
      contextMenu
    } = this.state

    return (
      <React.Fragment>
        <List dense {...passProps}>
          {downloads.length ? (
            downloads.map((dl, i) => {
              return (
                <DownloadListItem
                  key={dl.id}
                  divider={i !== downloads.length - 1}
                  downloadItem={dl}
                  onRequestExtraOptions={this.handleOpenExtraOptions}
                  onRequestClearFailedDownload={this.handleClearFailedDownload}
                  onRequestOpenContainingFolder={this.handleOpeningContainingFolder}
                  onRequestCancelActiveDownload={this.handleCancelActiveDownload} />
              )
            })
          ) : (
            <ListItem>
              <ListItemText
                primary='No downloads'
                primaryTypographyProps={{ color: 'textSecondary', align: 'center' }} />
            </ListItem>
          )}
        </List>
        <Menu
          {...(contextMenu ? {
            open: true,
            anchorEl: contextMenu.anchor,
            anchorPosition: contextMenu.anchorPosition
          } : {
            open: false
          })}
          MenuListProps={{ dense: true }}
          anchorReference='anchorPosition'
          disableEnforceFocus
          disableAutoFocusItem
          onClose={this.handleCloseContextMenu}>
          {contextMenu ? (
            contextMenu.isActive ? (
              <MenuItem onClick={this.handleContextMenuCancelDownload}>
                <ListItemText primary='Cancel download' />
              </MenuItem>
            ) : (
              <MenuItem onClick={this.handleContextMenuClearDownload}>
                <ListItemText primary='Remove from history' />
              </MenuItem>
            )
          ) : undefined}
          <MenuItem onClick={this.handleContextMenuClearAllDownloads}>
            <ListItemText primary='Clear downloads' />
          </MenuItem>
        </Menu>
      </React.Fragment>
    )
  }
}

export default DownloadList
