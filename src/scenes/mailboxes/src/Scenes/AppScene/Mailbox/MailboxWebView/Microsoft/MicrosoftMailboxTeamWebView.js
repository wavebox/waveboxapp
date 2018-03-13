import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxActions, MicrosoftTeamServiceReducer } from 'stores/mailbox'

const REF = 'mailbox_tab'
const TITLE_COUNT_RE = new RegExp('^[(]([0-9]+)[)].*?$')

export default class MicrosoftMailboxTeamWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles the page title updating
  * @param evt: the event that fired
  */
  handlePageTitleUpdated = (evt) => {
    const title = evt.title || ''

    let count = 0
    const match = TITLE_COUNT_RE.exec(title)
    if (match) {
      const matchCount = parseInt(match[1])
      if (!isNaN(matchCount)) {
        count = matchCount
      }
    }

    mailboxActions.reduceService(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.TEAM,
      MicrosoftTeamServiceReducer.setUnreadCount,
      count
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props
    return (
      <MailboxWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.TEAM}
        pageTitleUpdated={this.handlePageTitleUpdated} />
    )
  }
}
