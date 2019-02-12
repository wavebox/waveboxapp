import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import {
  ListItem, ListItemText, ListItemSecondaryAction, Typography,
  IconButton, Tooltip, LinearProgress
} from '@material-ui/core'
import React from 'react'
import Download from 'shared/Models/LocalHistory/Download'
import CloseIcon from '@material-ui/icons/Close'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import Timeago from 'react-timeago'
import ErrorIcon from '@material-ui/icons/Error'
import { withStyles } from '@material-ui/core/styles'
import path from 'path'

const styles = {
  secondaryText: {
    fontSize: '12px'
  }
}

@withStyles(styles)
class DownloadListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    downloadItem: PropTypes.object.isRequired,
    onRequestExtraOptions: PropTypes.func,
    onRequestClearFailedDownload: PropTypes.func.isRequired,
    onRequestOpenContainingFolder: PropTypes.func.isRequired,
    onRequestCancelActiveDownload: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the context menu request
  * @param evt: the event that fired
  */
  handleContextMenu = (evt) => {
    const { onContextMenu, onRequestExtraOptions, downloadItem } = this.props
    if (onContextMenu) { onContextMenu(evt) }

    if (onRequestExtraOptions) {
      onRequestExtraOptions(evt, downloadItem)
    }
  }

  /**
  * Hanldes opening the containing folder
  * @param evt: the event that fired
  */
  handleOpenContainingFolder = (evt) => {
    this.props.onRequestOpenContainingFolder(evt, this.props.downloadItem)
  }

  /**
  * Handles clearing a failed download
  * @param evt: the event that fired
  */
  handleClearFailedDownload = (evt) => {
    this.props.onRequestClearFailedDownload(evt, this.props.downloadItem)
  }

  /**
  * Handles cancelling a running download
  * @param evt: the event that fired
  */
  handleCancelActiveDownload = (evt) => {
    this.props.onRequestCancelActiveDownload(evt, this.props.downloadItem)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the text
  * @param classes: the classes to use
  * @param downloadItem: the download item to render
  * @return jsx
  */
  renderText (classes, downloadItem) {
    return (
      <ListItemText
        disableTypography
        primary={(
          <Typography variant='body1' noWrap>
            {(
              (typeof (downloadItem.downloadPath) === 'string'
                ? path.basename(downloadItem.downloadPath)
                : downloadItem.filename) || 'Untitled'
            )}
          </Typography>
        )}
        secondary={(
          <React.Fragment>
            <Typography
              className={classes.secondaryText}
              variant='body2'
              color='textSecondary'
              noWrap>
              {downloadItem.url}
            </Typography>
            {downloadItem.state === Download.STATES.ACTIVE ? (
              <LinearProgress
                variant='determinate'
                value={downloadItem.bytesPercent} />
            ) : (
              <Typography
                className={classes.secondaryText}
                variant='body2'
                color='textSecondary'
                noWrap>
                <Timeago date={downloadItem.changedTime} />
              </Typography>
            )}
          </React.Fragment>
        )} />
    )
  }

  /**
  * Renders the secondary action
  * @param downloadItem: the download item to render
  * @return jsx
  */
  renderSecondaryAction (downloadItem) {
    if (downloadItem.state === Download.STATES.ACTIVE) {
      return (
        <ListItemSecondaryAction>
          <Tooltip title='Cancel'>
            <IconButton onClick={this.handleCancelActiveDownload}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      )
    } else if (downloadItem.state === Download.STATES.FAILED) {
      return (
        <ListItemSecondaryAction>
          <Tooltip title='Failed. Click to remove'>
            <IconButton onClick={this.handleClearFailedDownload}>
              <ErrorIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      )
    } else {
      return (
        <ListItemSecondaryAction>
          <Tooltip title='Show downloaded file'>
            <IconButton onClick={this.handleOpenContainingFolder}>
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      )
    }
  }

  render () {
    const {
      classes,
      downloadItem,
      onRequestExtraOptions,
      onContextMenu,
      onRequestClearFailedDownload,
      onRequestOpenContainingFolder,
      onRequestCancelActiveDownload,
      ...passProps
    } = this.props

    return (
      <ListItem
        onContextMenu={this.handleContextMenu}
        {...passProps}>
        {this.renderText(classes, downloadItem)}
        {this.renderSecondaryAction(downloadItem)}
      </ListItem>
    )
  }
}

export default DownloadListItem
