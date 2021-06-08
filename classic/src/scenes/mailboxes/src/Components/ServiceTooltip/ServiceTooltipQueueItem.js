import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import TooltipSectionListItem from 'wbui/TooltipSectionListItem'
import TooltipSectionListItemText from 'wbui/TooltipSectionListItemText'
import TooltipSectionListItemSecondaryAction from 'wbui/TooltipSectionListItemSecondaryAction'
import CancelIcon from '@material-ui/icons/Cancel'
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
  }
})

@withStyles(styles, { withTheme: true })
class ServiceTooltipQueueItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    queueItem: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string,
      favicon: PropTypes.string
    }).isRequired,
    onOpenReadingQueueItem: PropTypes.func.isRequired,
    onDeleteReadingQueueItem: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { serviceId, onOpenReadingQueueItem, queueItem, onClick } = this.props
    onOpenReadingQueueItem(evt, serviceId, queueItem)
    if (onClick) { onClick(evt) }
  }

  /**
  * Handles the click event on bookmark
  * @param evt: the event that fired
  */
  handleDeleteItem = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()
    const { serviceId, onDeleteReadingQueueItem, queueItem } = this.props
    onDeleteReadingQueueItem(evt, serviceId, queueItem)
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
      onOpenReadingQueueItem,
      onDeleteReadingQueueItem,
      onClick,
      queueItem,
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
            queueItem.favicon
              ? { backgroundImage: `url("${queueItem.favicon}")` }
              : undefined
          )} />
        <TooltipSectionListItemText
          inset
          primaryTypographyProps={{ className: classes.text }}
          secondaryTypographyProps={{ className: classes.text }}
          primary={queueItem.title || <span>&nbsp;</span>}
          secondary={queueItem.url} />
        <TooltipSectionListItemSecondaryAction onClick={this.handleDeleteItem}>
          <CancelIcon />
        </TooltipSectionListItemSecondaryAction>
      </TooltipSectionListItem>
    )
  }
}

export default ServiceTooltipQueueItem
