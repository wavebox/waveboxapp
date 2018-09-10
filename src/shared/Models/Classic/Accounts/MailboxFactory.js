const MAILBOX_TYPES = require('./MailboxTypes')
const TrelloMailbox = require('./Trello/TrelloMailbox')
const SlackMailbox = require('./Slack/SlackMailbox')
const GoogleMailbox = require('./Google/GoogleMailbox')
const MicrosoftMailbox = require('./Microsoft/MicrosoftMailbox')
const GenericMailbox = require('./Generic/GenericMailbox')
const ContainerMailbox = require('./Container/ContainerMailbox')

class MailboxFactory {
  /**
  * Gets the class for the relevant mailbox model
  * @param mailboxType: the type of mailbox
  * @return the correct class or undefined
  */
  static getClass (mailboxType) {
    switch (mailboxType) {
      case MAILBOX_TYPES.TRELLO: return TrelloMailbox
      case MAILBOX_TYPES.SLACK: return SlackMailbox
      case MAILBOX_TYPES.GOOGLE: return GoogleMailbox
      case MAILBOX_TYPES.MICROSOFT: return MicrosoftMailbox
      case MAILBOX_TYPES.GENERIC: return GenericMailbox
      case MAILBOX_TYPES.CONTAINER: return ContainerMailbox
    }
  }

  /**
  * Converts plain data into the relevant mailbox model
  * @param id: the id of the mailbox
  * @param data: the data for the mailbox
  * @return the mailbox or undefined
  */
  static modelize (id, data) {
    const ModelClass = this.getClass(data.type)
    if (ModelClass) {
      return new ModelClass(id, data)
    } else {
      return undefined
    }
  }
}

module.exports = MailboxFactory
