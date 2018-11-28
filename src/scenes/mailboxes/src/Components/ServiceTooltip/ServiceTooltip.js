import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import ServiceTooltipContent from './ServiceTooltipContent'
import { accountActions } from 'stores/account'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import ReactDOM from 'react-dom'

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
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: false
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  handleTooltipOpen = (evt) => {
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

  handleTooltipClose = () => {
    this.setState({ open: false })
  }

  handleOpenSettings = () => {
    this.setState({ open: false }, () => {
      window.location.hash = `/settings/accounts/${this.props.mailboxId}:${this.props.serviceId}`
    })
  }

  handleReauthenticate = () => {
    this.setState({ open: false }, () => {
      accountActions.reauthenticateService(this.props.serviceId)
    })
  }

  handleOpenRecentItem = (evt, serviceId, recentItem) => {
    this.setState({ open: false }, () => {
      accountActions.navigateAndSwitchToService(serviceId, recentItem.url)
    })
  }

  handleBookmarkRecentItem = (evt, serviceId, recentItem) => {
    accountActions.reduceService(
      this.props.serviceId,
      ServiceReducer.addBookmark,
      recentItem.url,
      recentItem.title,
      recentItem.favicons
    )
  }

  handleOpenBookmarkItem = (evt, serviceId, bookmarkItem) => {
    this.setState({ open: false }, () => {
      accountActions.navigateAndSwitchToService(serviceId, bookmarkItem.url)
    })
  }

  handleDelteBookmark = (evt, serviceId, bookmarkItem) => {
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
        enterDelay={750}
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
            onDeleteBookmark={this.handleDelteBookmark} />
        )}
        {...passProps}>
        <div ref={this.childWrapRef}>
          {children}
        </div>
      </PrimaryTooltip>
    )
  }
}

export default ServiceTooltip
