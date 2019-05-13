import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import TooltipSectionListItem from 'wbui/TooltipSectionListItem'
import TooltipSectionListItemText from 'wbui/TooltipSectionListItemText'
import TooltipSectionListItemSecondaryAction from 'wbui/TooltipSectionListItemSecondaryAction'
import TooltipSectionListItemSecondaryActionButton from 'wbui/TooltipSectionListItemSecondaryActionButton'
import CancelIcon from '@material-ui/icons/Cancel'
import EditIcon from '@material-ui/icons/Edit'
import classNames from 'classnames'

const styles = (theme) => ({
  root: {
    paddingRight: 64
  },
  favicon: {
    width: 20,
    minWidth: 20,
    height: 20,
    minHeight: 20,
    marginRight: -7,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  text: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  editButton: {
    marginRight: -4
  },
  deleteButton: {
    marginLeft: -4
  }
})

@withStyles(styles, { withTheme: true })
class ServiceTooltipBookmarkItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    bookmark: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string,
      favicons: PropTypes.array
    }).isRequired,
    onOpenBookmark: PropTypes.func.isRequired,
    onEditBookmark: PropTypes.func.isRequired,
    onDeleteBookmark: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { serviceId, onOpenBookmark, bookmark, onClick } = this.props
    onOpenBookmark(evt, serviceId, bookmark)
    if (onClick) { onClick(evt) }
  }

  /**
  * Handles the click event on bookmark
  * @param evt: the event that fired
  */
  handleDeleteClick = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    const { serviceId, onDeleteBookmark, bookmark } = this.props
    onDeleteBookmark(evt, serviceId, bookmark)
  }

  handleEditClick = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    const { serviceId, onEditBookmark, bookmark } = this.props
    onEditBookmark(evt, serviceId, bookmark)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      onOpenBookmark,
      onDeleteBookmark,
      onEditBookmark,
      onClick,
      bookmark,
      classes,
      theme,
      className,
      ...passProps
    } = this.props

    return (
      <TooltipSectionListItem
        button
        onClick={this.handleClick}
        className={classNames(classes.root, className)}
        {...passProps}>
        <div
          className={classes.favicon}
          style={(
            (bookmark.favicons || []).length
              ? { backgroundImage: `url("${bookmark.favicons.slice(-1)[0]}")` }
              : undefined
          )} />
        <TooltipSectionListItemText
          inset
          primaryTypographyProps={{ className: classes.text }}
          secondaryTypographyProps={{ className: classes.text }}
          primary={bookmark.title || <span>&nbsp;</span>}
          secondary={bookmark.url} />
        <TooltipSectionListItemSecondaryAction disableButton>
          <TooltipSectionListItemSecondaryActionButton onClick={this.handleEditClick} className={classes.editButton}>
            <EditIcon />
          </TooltipSectionListItemSecondaryActionButton>
          <TooltipSectionListItemSecondaryActionButton onClick={this.handleDeleteClick} className={classes.deleteButton}>
            <CancelIcon />
          </TooltipSectionListItemSecondaryActionButton>
        </TooltipSectionListItemSecondaryAction>
      </TooltipSectionListItem>
    )
  }
}

export default ServiceTooltipBookmarkItem
