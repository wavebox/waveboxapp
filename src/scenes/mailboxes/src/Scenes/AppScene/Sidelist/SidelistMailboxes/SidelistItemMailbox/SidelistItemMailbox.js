import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import SidelistMultiService from './SidelistMultiService'
import SidelistSingleService from './SidelistSingleService'
import shallowCompare from 'react-addons-shallow-compare'

class SidelistItemMailbox extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId } = this.props
    const mailbox = accountStore.getState().getMailbox(mailboxId)
    return {
      isSingleService: mailbox ? mailbox.hasSingleService : true
    }
  })()

  accountChanged = (accountState) => {
    const { mailboxId } = this.props
    const mailbox = accountState.getMailbox(mailboxId)
    this.setState({
      isSingleService: mailbox ? mailbox.hasSingleService : true
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    if (this.state.isSingleService) {
      return (<SidelistSingleService {...this.props} />)
    } else {
      return (<SidelistMultiService {...this.props} />)
    }
  }
}

export default SidelistItemMailbox
