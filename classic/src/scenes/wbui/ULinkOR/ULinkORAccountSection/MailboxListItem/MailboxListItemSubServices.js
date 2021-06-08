import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { List } from '@material-ui/core'
import MailboxListItemSubServiceItem from './MailboxListItemSubServiceItem'

const privAccountStore = Symbol('privAccountStore')

class MailboxListItemSubServices extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    accountStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired,
    onOpenInRunningService: PropTypes.func.isRequired,
    onOpenInServiceWindow: PropTypes.func.isRequired,
    onItemKeyDown: PropTypes.func
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this[privAccountStore] = this.props.accountStore

    // Generate state
    this.state = {
      ...this.generateServiceState(this.props.mailboxId, this[privAccountStore].getState())
    }
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this[privAccountStore].listen(this.accountUpdated)
  }

  componentWillUnmount () {
    this[privAccountStore].unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.accountStore !== nextProps.accountStore) {
      console.warn('Changing props.accountStore is not supported in ULinkORAccountResultListItemServices and will be ignored')
    }

    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.generateServiceState(nextProps.mailboxId, this[privAccountStore].getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  accountUpdated = (accountState) => {
    this.setState(
      this.generateServiceState(this.props.mailboxId, accountState)
    )
  }

  generateServiceState (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)

    if (mailbox) {
      return {
        serviceIds: mailbox.allServices
      }
    } else {
      return {
        serviceIds: []
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      avatarResolver,
      accountStore,
      onOpenInRunningService,
      onOpenInServiceWindow,
      onItemKeyDown
    } = this.props
    const {
      serviceIds
    } = this.state

    return (
      <List component='div' dense disablePadding>
        {serviceIds.map((serviceId) => {
          return (
            <MailboxListItemSubServiceItem
              key={serviceId}
              onKeyDown={onItemKeyDown}
              serviceId={serviceId}
              accountStore={accountStore}
              avatarResolver={avatarResolver}
              onOpenInRunningService={onOpenInRunningService}
              onOpenInServiceWindow={onOpenInServiceWindow} />
          )
        })}
      </List>
    )
  }
}

export default MailboxListItemSubServices
