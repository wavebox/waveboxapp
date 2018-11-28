import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import ServiceTooltipContent from './ServiceTooltipContent'
import { accountStore, accountActions } from 'stores/account'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import ReactDOM from 'react-dom'

const ENTER_DELAY = 750

class ServiceTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
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
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
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
    isServiceActive: accountStore.getState().isServiceActive(this.props.serviceId)
  }

  accountChanged = (accountState) => {
    this.setState({
      isServiceActive: accountState.isServiceActive(this.props.serviceId)
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
    if (this.state.isServiceActive) {
      this.setState((prevState) => {
        return { open: !prevState.open }
      })
    } else {
      this.setState({ open: false })
      this.dumpOpen = true
      clearTimeout(this.dumpOpenExpirer)
      this.dumpOpenExpirer = setTimeout(() => {
        this.dumpOpen = false
      }, ENTER_DELAY * 2)
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
      accountActions.navigateAndSwitchToService(serviceId, recentItem.url)
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
      recentItem.url,
      recentItem.title,
      recentItem.favicons
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
      accountActions.navigateAndSwitchToService(serviceId, bookmarkItem.url)
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
      ...passProps
    } = this.props
    const {
      open
    } = this.state

    return (
      <PrimaryTooltip
        interactive
        disablePadding
        width={400}
        enterDelay={ENTER_DELAY}
        leaveDelay={1}
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        open={open}
        title={(
          <ServiceTooltipContent
            innerRef={this.contentRef}
            serviceId={serviceId}
            onOpenSettings={this.handleOpenSettings}
            onReauthenticate={this.handleReauthenticate}
            onOpenRecentItem={this.handleOpenRecentItem}
            onBookmarkRecentItem={this.handleBookmarkRecentItem}
            onOpenBookmarkItem={this.handleOpenBookmarkItem}
            onDeleteBookmark={this.handleDeleteBookmark} />
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
