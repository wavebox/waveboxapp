const MAILBOX_TYPES = require('./MailboxTypes')
const SERVICE_TYPES = require('./ServiceTypes')

const CoreService = require('./CoreService')
const TrelloDefaultService = require('./Trello/TrelloDefaultService')
const SlackDefaultService = require('./Slack/SlackDefaultService')
const GoogleDefaultService = require('./Google/GoogleDefaultService')
const GoogleCalendarService = require('./Google/GoogleCalendarService')
const GoogleCommunicationService = require('./Google/GoogleCommunicationService')
const GoogleContactsService = require('./Google/GoogleContactsService')
const GoogleNotesService = require('./Google/GoogleNotesService')
const GooglePhotosService = require('./Google/GooglePhotosService')
const GoogleStorageService = require('./Google/GoogleStorageService')
const GoogleDocsService = require('./Google/GoogleDocsService')
const GoogleSheetsService = require('./Google/GoogleSheetsService')
const GoogleSlidesService = require('./Google/GoogleSlidesService')
const GoogleAnalyticsService = require('./Google/GoogleAnalyticsService')
const GoogleVideoService = require('./Google/GoogleVideoService')
const GoogleSocialService = require('./Google/GoogleSocialService')
const GoogleMessengerService = require('./Google/GoogleMessengerService')
const GoogleClassroomService = require('./Google/GoogleClassroomService')
const GoogleMusicService = require('./Google/GoogleMusicService')
const GoogleFiService = require('./Google/GoogleFiService')
const GoogleAdminService = require('./Google/GoogleAdminService')
const GoogleTeamService = require('./Google/GoogleTeamService')
const GooglePhoneService = require('./Google/GooglePhoneService')
const MicrosoftDefaultService = require('./Microsoft/MicrosoftDefaultService')
const MicrosoftCalendarService = require('./Microsoft/MicrosoftCalendarService')
const MicrosoftContactsService = require('./Microsoft/MicrosoftContactsService')
const MicrosoftNotesService = require('./Microsoft/MicrosoftNotesService')
const MicrosoftStorageService = require('./Microsoft/MicrosoftStorageService')
const MicrosoftDocsService = require('./Microsoft/MicrosoftDocsService')
const MicrosoftNotebookService = require('./Microsoft/MicrosoftNotebookService')
const MicrosoftSheetsService = require('./Microsoft/MicrosoftSheetsService')
const MicrosoftSlidesService = require('./Microsoft/MicrosoftSlidesService')
const MicrosoftTeamService = require('./Microsoft/MicrosoftTeamService')
const MicrosoftTaskService = require('./Microsoft/MicrosoftTaskService')
const GenericDefaultService = require('./Generic/GenericDefaultService')
const ContainerDefaultService = require('./Container/ContainerDefaultService')

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
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.DOCS: return GoogleDocsService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.SHEETS: return GoogleSheetsService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.SLIDES: return GoogleSlidesService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.ANALYTICS: return GoogleAnalyticsService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.VIDEO: return GoogleVideoService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.SOCIAL: return GoogleSocialService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.MESSENGER: return GoogleMessengerService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.CLASSROOM: return GoogleClassroomService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.MUSIC: return GoogleMusicService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.FI: return GoogleFiService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.ADMIN: return GoogleAdminService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.TEAM : return GoogleTeamService
      case MAILBOX_TYPES.GOOGLE + ':' + SERVICE_TYPES.PHONE: return GooglePhoneService

      // Microsoft
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.DEFAULT: return MicrosoftDefaultService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.CALENDAR: return MicrosoftCalendarService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.CONTACTS: return MicrosoftContactsService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.NOTES: return MicrosoftNotesService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.STORAGE: return MicrosoftStorageService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.DOCS: return MicrosoftDocsService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.NOTEBOOK: return MicrosoftNotebookService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.SHEETS: return MicrosoftSheetsService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.SLIDES: return MicrosoftSlidesService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.TEAM: return MicrosoftTeamService
      case MAILBOX_TYPES.MICROSOFT + ':' + SERVICE_TYPES.TASK: return MicrosoftTaskService

      // Generic
      case MAILBOX_TYPES.GENERIC + ':' + SERVICE_TYPES.DEFAULT: return GenericDefaultService

      // Container
      case MAILBOX_TYPES.CONTAINER + ':' + SERVICE_TYPES.DEFAULT: return ContainerDefaultService

      default: return CoreService
    }
  }

  /**
  * Converts plain data into the relevant service model
  * @param mailboxId: the id of the mailbox
  * @param mailboxType: the type of mailbox
  * @param data: the data for the mailbox
  * @param metadata={}: the metadata for this service
  * @param mailboxMigrationData={}: mailbox migration data for this service
  * @return the service or undefined
  */
  static modelize (mailboxId, mailboxType, data, metadata = {}, mailboxMigrationData = {}) {
    const ModelClass = this.getClass(mailboxType, data.type)
    if (ModelClass) {
      return new ModelClass(mailboxId, data, metadata, mailboxMigrationData)
    } else {
      return undefined
    }
  }
}

module.exports = ServiceFactory
