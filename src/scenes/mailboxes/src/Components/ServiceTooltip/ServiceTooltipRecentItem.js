import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import TooltipSectionListItem from 'wbui/TooltipSectionListItem'
import TooltipSectionListItemText from 'wbui/TooltipSectionListItemText'
import TooltipSectionListItemSecondaryAction from 'wbui/TooltipSectionListItemSecondaryAction'
import FASMapPinIcon from 'wbfa/FASMapPin'
import classNames from 'classnames'

const styles = (theme) => ({
  root: {
    paddingRight: 32
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
  bookmarkIcon: {
    width: '1.2rem !important',
    height: '1.2rem !important'
  }
})

@withStyles(styles, { withTheme: true })
class ServiceTooltipRecentItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    recentItem: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string,
      favicons: PropTypes.array
    }).isRequired,
    onOpenRecentItem: PropTypes.func.isRequired,
    onBookmarkRecentItem: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { serviceId, onOpenRecentItem, recentItem, onClick } = this.props
    onOpenRecentItem(evt, serviceId, recentItem)
    if (onClick) { onClick(evt) }
  }

  /**
  * Handles the click event on bookmark
  * @param evt: the event that fired
  */
  handleBookmarkClick = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    const { serviceId, onBookmarkRecentItem, recentItem } = this.props
    onBookmarkRecentItem(evt, serviceId, recentItem)
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
      onOpenRecentItem,
      onBookmarkRecentItem,
      onClick,
      recentItem,
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
            (recentItem.favicons || []).length
              ? { backgroundImage: `url("${recentItem.favicons.slice(-1)[0]}")` }
              : undefined
          )} />
        <TooltipSectionListItemText
          inset
          primaryTypographyProps={{ className: classes.text }}
          secondaryTypographyProps={{ className: classes.text }}
          primary={recentItem.title || <span>&nbsp;</span>}
          secondary={recentItem.url || <span>&nbsp;</span>} />
        <TooltipSectionListItemSecondaryAction onClick={this.handleBookmarkClick}>
          <FASMapPinIcon className={classes.bookmarkIcon} />
        </TooltipSectionListItemSecondaryAction>
      </TooltipSectionListItem>
    )
  }
}

export default ServiceTooltipRecentItem
