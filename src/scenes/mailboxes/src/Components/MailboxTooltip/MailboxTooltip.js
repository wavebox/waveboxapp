import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountActions } from 'stores/account'
import PrimaryTooltip from 'wbui/PrimaryTooltip'
import MailboxTooltipContent from './MailboxTooltipContent'

class MailboxTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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

  handleTooltipOpen = () => {
    this.setState({ open: true })
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
        onClose={this.handleTooltipClose}
        onOpen={this.handleTooltipOpen}
        open={open}
        title={(
          <MailboxTooltipContent
            mailboxId={mailboxId}
            onOpenService={this.handleOpenService}
            onOpenSettings={this.handleOpenSettings}
            onAddService={this.handleAddService} />
        )}
        {...passProps}>
        {children}
      </PrimaryTooltip>
    )
  }
}

export default MailboxTooltip
