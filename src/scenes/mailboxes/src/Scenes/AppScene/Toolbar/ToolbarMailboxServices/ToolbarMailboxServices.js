import PropTypes from 'prop-types'
import React from 'react'
import { accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxAndServiceContextMenu from 'Components/MailboxAndServiceContextMenu'
import ErrorBoundary from 'wbui/ErrorBoundary'
import ServiceTabs from 'Components/ServiceTabs'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'

class ToolbarMailboxServices extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    toolbarHeight: PropTypes.number.isRequired,
    uiLocation: PropTypes.oneOf([
      ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START,
      ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END
    ])
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.popoverCustomizeClearTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.popoverCustomizeClearTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      popover: false,
      popoverAnchor: null,
      popoverMailboxId: undefined,
      popoverServiceId: undefined
    }
  })()

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles a service being clicked
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  */
  handleClickService = (evt, serviceId) => {
    evt.preventDefault()
    accountActions.changeActiveService(serviceId)
  }

  /**
  * Opens the popover for a service
  * @param evt: the event that fired
  * @param serviceId: the id of the service to open for
  */
  handleOpenServicePopover = (evt, serviceId) => {
    evt.preventDefault()
    clearTimeout(this.popoverCustomizeClearTO)
    this.setState({
      isHoveringAvatar: false,
      isHoveringGroup: false,
      popover: true,
      popoverMailboxId: this.props.mailboxId,
      popoverServiceId: serviceId,
      popoverAnchor: evt.currentTarget
    })
  }

  handleClosePopover = () => {
    clearTimeout(this.popoverCustomizeClearTO)
    this.popoverCustomizeClearTO = setTimeout(() => {
      this.setState({
        popoverMailboxId: undefined,
        popoverServiceId: undefined
      })
    }, 500)
    this.setState({ popover: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      toolbarHeight,
      uiLocation,
      ...passProps
    } = this.props
    const {
      popover,
      popoverAnchor,
      popoverMailboxId,
      popoverServiceId
    } = this.state

    return (
      <div {...passProps}>
        <ServiceTabs
          mailboxId={mailboxId}
          uiLocation={uiLocation}
          onOpenService={this.handleClickService}
          onContextMenuService={this.handleOpenServicePopover} />
        {popoverMailboxId && popoverServiceId ? (
          <ErrorBoundary>
            <MailboxAndServiceContextMenu
              mailboxId={popoverMailboxId}
              serviceId={popoverServiceId}
              isOpen={popover}
              anchor={popoverAnchor}
              onRequestClose={this.handleClosePopover} />
          </ErrorBoundary>
        ) : undefined}
      </div>
    )
  }
}

export default ToolbarMailboxServices
