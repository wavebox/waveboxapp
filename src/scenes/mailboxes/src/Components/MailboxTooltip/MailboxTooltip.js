import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountActions } from 'stores/account'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import MailboxTooltipContent from './MailboxTooltipContent'
import ReactDOM from 'react-dom'

class MailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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

  handleOpenService = (evt, serviceId) => {
    this.setState({ open: false }, () => {
      accountActions.changeActiveService(serviceId)
    })
  }

  handleOpenSettings = (evt) => {
    this.setState({ open: false }, () => {
      window.location.hash = `/settings/accounts/${this.props.mailboxId}`
    })
  }

  handleAddService = (evt) => {
    this.setState({ open: false }, () => {
      window.location.hash = `/mailbox_wizard/add/${this.props.mailboxId}`
    })
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
          <MailboxTooltipContent
            innerRef={this.contentRef}
            mailboxId={mailboxId}
            onOpenService={this.handleOpenService}
            onOpenSettings={this.handleOpenSettings}
            onAddService={this.handleAddService} />
        )}
        {...passProps}>
        <div ref={this.childWrapRef}>
          {children}
        </div>
      </PrimaryTooltip>
    )
  }
}

export default MailboxTooltip
