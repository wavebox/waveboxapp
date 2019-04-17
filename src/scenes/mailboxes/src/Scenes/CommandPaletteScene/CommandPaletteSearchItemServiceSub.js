import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import CommandPaletteSearchItem from './CommandPaletteSearchItem'
import { withStyles } from '@material-ui/core/styles'
import FASMapPinIcon from 'wbfa/FASMapPin'
import HistoryIcon from '@material-ui/icons/History'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import classNames from 'classnames'
import ACAvatarCircle2 from 'wbui/ACAvatarCircle2'
import Resolver from 'Runtime/Resolver'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import SEARCH_TARGETS from './CommandPaletteSearchEngine/CommandPaletteSearchTargets'

const styles = {
  targetIcon: {
    fontSize: '20px',
    verticalAlign: 'bottom',
    marginRight: 4
  },
  targetFAIcon: {
    width: '1.1rem !important',
    height: '1.1rem !important'
  },
  favicon: {
    width: '100%',
    height: '100%',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  faviconMissing: {
    border: '1px solid #CACAC8'
  },
  faviconService: {
    position: 'absolute',
    right: -6,
    bottom: -1
  },
  block: {
    display: 'block'
  }
}

@withStyles(styles)
class CommandPaletteSearchItemServiceSub extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    itemId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    searchTarget: PropTypes.oneOf([
      SEARCH_TARGETS.RECENT,
      SEARCH_TARGETS.BOOKMARK,
      SEARCH_TARGETS.READING_QUEUE
    ]).isRequired,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    const changed =
      this.props.serviceId !== nextProps.serviceId ||
      this.props.itemId !== nextProps.itemId ||
      this.props.searchTarget !== nextProps.searchTarget

    if (changed) {
      this.setState(this.generateItemState(nextProps, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateItemState(this.props, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState(this.generateItemState(this.props, accountState))
  }

  generateItemState ({ itemId, searchTarget, serviceId }, accountState) {
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)
    if (!service || !serviceData) { return { hasMembers: false } }

    let item
    switch (searchTarget) {
      case SEARCH_TARGETS.RECENT:
        item = serviceData.getRecentWithId(itemId)
        break
      case SEARCH_TARGETS.BOOKMARK:
        item = service.getBookmarkWithId(itemId)
        break
      case SEARCH_TARGETS.READING_QUEUE:
        item = service.getReadingQueueItemWithId(itemId)
        break
    }
    if (!item) { return { hasMembers: false } }

    return {
      hasMembers: true,
      item: item,
      serviceDisplayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(service.parentId)
      ),
      mailboxHelperDisplayName: accountState.resolvedMailboxExplicitServiceDisplayName(service.parentId),
      serviceAvatar: accountState.getServiceAvatarConfig(serviceId)
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { serviceId, searchTarget, onRequestClose, onClick } = this.props
    const { item } = this.state
    switch (searchTarget) {
      case SEARCH_TARGETS.BOOKMARK:
        WBRPCRenderer.wavebox.openRecentLink(serviceId, item)
        break
      case SEARCH_TARGETS.READING_QUEUE:
        WBRPCRenderer.wavebox.openReadingQueueLink(serviceId, item)
        break
      case SEARCH_TARGETS.RECENT:
        WBRPCRenderer.wavebox.openRecentLink(serviceId, item)
        break
    }
    onRequestClose()
    if (onClick) {
      onClick(evt)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the search target icon
  * @param classes: the classes to use
  * @param searchTarget: the search target
  * @return jsx
  */
  renderSearchTargetIcon (classes, searchTarget) {
    switch (searchTarget) {
      case SEARCH_TARGETS.BOOKMARK:
        return (<FASMapPinIcon className={classNames(classes.targetIcon, classes.targetFAIcon)} />)
      case SEARCH_TARGETS.READING_QUEUE:
        return (<CheckCircleOutlineIcon className={classes.targetIcon} />)
      case SEARCH_TARGETS.RECENT:
        return (<HistoryIcon className={classes.targetIcon} />)
    }
  }

  render () {
    const {
      classes,
      itemId,
      serviceId,
      onRequestClose,
      searchTarget,
      onClick,
      ...passProps
    } = this.props
    const {
      hasMembers,
      serviceDisplayName,
      mailboxHelperDisplayName,
      item,
      serviceAvatar
    } = this.state
    if (!hasMembers) { return false }

    const faviconUrl = item.favicon || (item.favicons || []).slice(-1)[0]

    return (
      <CommandPaletteSearchItem
        onClick={this.handleClick}
        primaryText={(
          <React.Fragment>
            {this.renderSearchTargetIcon(classes, searchTarget)}
            {item.title}
          </React.Fragment>
        )}
        secondaryText={(
          <React.Fragment>
            <span className={classes.block}>
              {serviceDisplayName === mailboxHelperDisplayName
                ? serviceDisplayName
                : `${serviceDisplayName}: ${mailboxHelperDisplayName}`
              }
            </span>
            <span className={classes.block}>{item.url}</span>
          </React.Fragment>
        )}
        avatar={(
          <div
            className={classNames(classes.favicon, faviconUrl ? undefined : classes.faviconMissing)}
            style={faviconUrl ? { backgroundImage: `url("${faviconUrl}")` } : undefined}>
            <ACAvatarCircle2
              className={classes.faviconService}
              avatar={serviceAvatar}
              size={16}
              resolver={(i) => Resolver.image(i)} />
          </div>
        )}
        {...passProps} />
    )
  }
}

export default CommandPaletteSearchItemServiceSub
