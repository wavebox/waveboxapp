import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import shallowCompare from 'react-addons-shallow-compare'

const REF = 'mailbox_tab'
const BADGE_REGEXP = new RegExp('(chat-favicon-new-non-notif|chat-favicon-new-notif)')

export default class GoogleChatServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles the page favicon updating
  * @param evt: the event that fired
  */
  handlePageFaviconUpdated = (evt) => {
    //TODO move this into the service model and epricate me
    /*const hasUnread = !!evt.favicons.find((favicon) => {
      return BADGE_REGEXP.exec(favicon) !== null
    })
    mailboxActions.reduceService(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.TEAM,
      GoogleTeamServiceReducer.setHasUnreadActivity,
      hasUnread
    )*/
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, serviceId } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        pageFaviconUpdated={this.handlePageFaviconUpdated} />
    )
  }
}
