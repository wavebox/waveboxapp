const MailboxReducer = require('./MailboxReducer')

class SlackMailboxReducer extends MailboxReducer {
  /**
  * Sets the basic profile info for this account
  * @param mailbox: the mailbox to update
  * @param teamOverview: the overview of the team
  * @param selfOverview: the overview of the user
  */
  static setTeamAndSelfOverview (mailbox, teamOverview, selfOverview) {
    return mailbox.changeData({
      teamOverview: teamOverview,
      selfOverview: selfOverview
    })
  }
}

module.exports = SlackMailboxReducer
