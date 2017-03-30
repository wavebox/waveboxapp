const MAILBOX_TYPES = require('./MailboxTypes')
const SERVICE_TYPES = require('./ServiceTypes')

const TrelloDefaultService = require('./Trello/TrelloDefaultService')
const SlackDefaultService = require('./Slack/SlackDefaultService')
const GoogleDefaultService = require('./Google/GoogleDefaultService')
const GoogleCalendarService = require('./Google/GoogleCalendarService')
const GoogleCommunicationService = require('./Google/GoogleCommunicationService')
const GoogleContactsService = require('./Google/GoogleContactsService')
const GoogleNotesService = require('./Google/GoogleNotesService')
const GooglePhotosService = require('./Google/GooglePhotosService')
const GoogleStorageService = require('./Google/GoogleStorageService')
const MicrosoftDefaultService = require('./Microsoft/MicrosoftDefaultService')
const MicrosoftCalendarService = require('./Microsoft/MicrosoftCalendarService')
const MicrosoftContactsService = require('./Microsoft/MicrosoftContactsService')
const MicrosoftNotesService = require('./Microsoft/MicrosoftNotesService')
const MicrosoftStorageService = require('./Microsoft/MicrosoftStorageService')
const GenericDefaultService = require('./Generic/GenericDefaultService')

class ServiceFactory {
  /**
  * Gets the class for the relevant service model
  * @param mailboxType: the type of mailbox
  * @param serviceType: the type of service
  * @return the correct class or undefined
  */
  static getClass (mailboxType, serviceType) {
    switch (mailboxType + ':' + serviceType) {
      // Trello
      case MAILBOX_TYPES.TRELLO + ':' + SERVICE_TYPES.DEFAULT: return TrelloDefaultService

      // Slack
      case MAILBOX_TYPES.SLACK + ':' + SERVICE_TYPES.DEFAULT: return SlackDefaultService

      // Google
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.DEFAULT: return GoogleDefaultService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.CALENDAR: return GoogleCalendarService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.COMMUNICATION: return GoogleCommunicationService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.CONTACTS: return GoogleContactsService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.NOTES: return GoogleNotesService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.PHOTOS: return GooglePhotosService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.STORAGE: return GoogleStorageService

      // Microsoft
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.DEFAULT: return MicrosoftDefaultService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.CALENDAR: return MicrosoftCalendarService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.CONTACTS: return MicrosoftContactsService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.NOTES: return MicrosoftNotesService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.STORAGE: return MicrosoftStorageService

      // Generic
      case MAILBOX_TYPES.GENERIC + ':' + SERVICE_TYPES.DEFAULT: return GenericDefaultService
    }
  }

  /**
  * Converts plain data into the relevant service model
  * @param mailboxId: the id of the mailbox
  * @param mailboxType: the type of mailbox
  * @param data: the data for the mailbox
  * @param metadata={}: the metadata for this service
  * @return the service or undefined
  */
  static modelize (mailboxId, mailboxType, data, metadata = {}) {
    const ModelClass = this.getClass(mailboxType, data.type)
    if (ModelClass) {
      return new ModelClass(mailboxId, data, metadata)
    } else {
      return undefined
    }
  }
}

module.exports = ServiceFactory
