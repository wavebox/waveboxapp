import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
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
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      const mailbox = accountStore.getState().getMailbox(nextProps.mailboxId)
      this.setState({
        isSingleService: mailbox ? mailbox.hasSingleService : true
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const { mailboxId } = this.props
    const mailbox = accountStore.getState().getMailbox(mailboxId)
    return {
      isSingleService: mailbox ? mailbox.hasSingleService : true,
      sidebarSize: settingsStore.getState().ui.sidebarSize
    }
  })()

  accountChanged = (accountState) => {
    const { mailboxId } = this.props
    const mailbox = accountState.getMailbox(mailboxId)
    this.setState({
      isSingleService: mailbox ? mailbox.hasSingleService : true
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      sidebarSize: settingsState.ui.sidebarSize
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isSingleService, sidebarSize } = this.state
    if (isSingleService) {
      return (<SidelistSingleService sidebarSize={sidebarSize} {...this.props} />)
    } else {
      return (<SidelistMultiService sidebarSize={sidebarSize} {...this.props} />)
    }
  }
}

export default SidelistItemMailbox
