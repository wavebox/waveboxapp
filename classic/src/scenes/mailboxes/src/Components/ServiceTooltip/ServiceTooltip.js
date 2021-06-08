import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import ServiceTooltipContent from './ServiceTooltipContent'
import ServiceTooltipSimpleContent from './ServiceTooltipSimpleContent'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import ReactDOM from 'react-dom'
import WBRPCRenderer from 'shared/WBRPCRenderer'

class ServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    simpleMode: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.contentRef = React.createRef()
    this.childWrapRef = React.createRef()
    this.dumpOpen = false
    this.dumpOpenExpirer = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
    clearTimeout(this.dumpOpenExpirer)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState({
        isServiceActive: accountStore.getState().isServiceActive(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: false,
    isServiceActive: accountStore.getState().isServiceActive(this.props.serviceId),
    openDelay: settingsStore.getState().ui.accountTooltipDelay
  }

  accountChanged = (accountState) => {
    this.setState({
      isServiceActive: accountState.isServiceActive(this.props.serviceId)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      openDelay: settingsState.ui.accountTooltipDelay
    })
  }

  /* **************************************************************************/
  // Tooltip Actions
  /* **************************************************************************/

  /**
  * Handles the request to open the tooltip
  * @param evt: the event that fired
  */
  handleTooltipOpen = (evt) => {
    if (this.dumpOpen) { return }

    // If you click on an element in the tooltip which causes a redraw but decide
    // to set open=false during the click it can cause the onOpen call to fire again.
    // This causes the tooltip to flash down and up. To guard against this check
    // who's firing the open call and if it's not one of the children ignore it
    evt.persist()
    this.setState((prevState) => {
      if (prevState.open === false) {
        const contentNode = ReactDOM.findDOMNode(this.contentRef.current)
        if (contentNode) {
          if (contentNode.contains(evt.target)) {
            return {}
          }
        }

        const childrenNode = ReactDOM.findDOMNode(this.childWrapRef.current)
        if (!childrenNode || !childrenNode.contains(evt.target)) {
          return {}
        }
      }
      return { open: true }
    })
  }

  /**
  * Handles the tooltip close event
  * @param evt: the event that fired
  */
  handleTooltipClose = () => {
    this.setState({ open: false })
    this.dumpOpen = false
    clearTimeout(this.dumpOpenExpirer)
  }

  /**
  * Handles the child wrapper being clicked and decides to show or not
  * @param evt: the event that fired
  */
  handleChildWrapClick = (evt) => {
    const { openDelay, isServiceActive } = this.state
    if (isServiceActive) {
      this.setState((prevState) => {
        return { open: !prevState.open }
      })
    } else {
      this.setState({ open: false })
      this.dumpOpen = true
      clearTimeout(this.dumpOpenExpirer)
      this.dumpOpenExpirer = setTimeout(() => {
        this.dumpOpen = false
      }, openDelay * 2)
    }
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  /**
  * Handles opening settings from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleOpenSettings = (evt, serviceId) => {
    this.setState({ open: false }, () => {
      window.location.hash = `/settings/accounts/${this.props.mailboxId}:${this.props.serviceId}`
    })
  }

  /**
  * Handles reauthenticating from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleReauthenticate = (evt, serviceId) => {
    this.setState({ open: false }, () => {
      accountActions.reauthenticateService(serviceId)
    })
  }

  /**
  * Handles opening recent items from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param recentItem: the recent item to open
  */
  handleOpenRecentItem = (evt, serviceId, recentItem) => {
    this.setState({ open: false }, () => {
      WBRPCRenderer.wavebox.openRecentLink(serviceId, recentItem)
    })
  }

  /**
  * Handles bookmarking a recent item from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param recentItem: the recent item to bookmark
  */
  handleBookmarkRecentItem = (evt, serviceId, recentItem) => {
    accountActions.reduceService(
      this.props.serviceId,
      ServiceReducer.addBookmark,
      recentItem
    )
  }

  /**
  * Handles opening bookmark items from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param bookmarkItem: the bookmark to open
  */
  handleOpenBookmarkItem = (evt, serviceId, bookmarkItem) => {
    this.setState({ open: false }, () => {
      WBRPCRenderer.wavebox.openRecentLink(serviceId, bookmarkItem)
    })
  }

  /**
  * Handles editing a bookmark
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param bookmarkItem: the bookmark item to edit
  */
  handleEditBookmark = (evt, serviceId, bookmarkItem) => {
    this.setState({ open: false }, () => {
      window.location.hash = `/bookmark/edit/${serviceId}/${bookmarkItem.id}`
    })
  }

  /**
  * Handles deleting a bookmark from within the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param recentItem: the recent item to delete
  */
  handleDeleteBookmark = (evt, serviceId, bookmarkItem) => {
    accountActions.reduceService(
      this.props.serviceId,
      ServiceReducer.removeBookmark,
      bookmarkItem.id
    )
  }

  /**
  * Handles opening a reading queue item from the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param readingItem: the reading item to open
  */
  handleOpenReadingQueueItem = (evt, serviceId, readingItem) => {
    this.setState({ open: false }, () => {
      WBRPCRenderer.wavebox.openReadingQueueLink(serviceId, readingItem)
    })
  }

  /**
  * Handles deleting a reading queue item from the tooltip
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param readingItem: the reading item to delte
  */
  handleDeleteReadingQueueItem = (evt, serviceId, readingItem) => {
    accountActions.removeFromReadingQueue(serviceId, readingItem.id)
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
      mailboxId,
      className,
      children,
      simpleMode,
      ...passProps
    } = this.props
    const {
      open,
      openDelay
    } = this.state
    return (
      <PrimaryTooltip
        {...(simpleMode ? {
          interactive: false,
          disablePadding: false
        } : {
          interactive: true,
          disablePadding: true
        })}
        enterDelay={openDelay <= 0 ? undefined : openDelay}
        leaveDelay={1}
        width={400}
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        open={open}
        title={simpleMode ? (
          <ServiceTooltipSimpleContent
            innerRef={this.contentRef}
            serviceId={serviceId} />
        ) : (
          <ServiceTooltipContent
            innerRef={this.contentRef}
            serviceId={serviceId}
            onOpenSettings={this.handleOpenSettings}
            onReauthenticate={this.handleReauthenticate}
            onOpenRecentItem={this.handleOpenRecentItem}
            onBookmarkRecentItem={this.handleBookmarkRecentItem}
            onOpenBookmarkItem={this.handleOpenBookmarkItem}
            onEditBookmark={this.handleEditBookmark}
            onDeleteBookmark={this.handleDeleteBookmark}
            onOpenReadingQueueItem={this.handleOpenReadingQueueItem}
            onDeleteReadingQueueItem={this.handleDeleteReadingQueueItem} />
        )}
        {...passProps}>
        <div
          ref={this.childWrapRef}
          onClick={this.handleChildWrapClick}>
          {children}
        </div>
      </PrimaryTooltip>
    )
  }
}

export default ServiceTooltip
