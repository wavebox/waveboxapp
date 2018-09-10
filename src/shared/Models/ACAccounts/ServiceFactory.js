import SERVICE_TYPES from './ServiceTypes'
import CoreACServiceData from './CoreACServiceData'

import TrelloService from './Trello/TrelloService'
import TrelloServiceData from './Trello/TrelloServiceData'
import SlackService from './Slack/SlackService'
import SlackServiceData from './Slack/SlackServiceData'
import GenericService from './Generic/GenericService'
import GenericServiceData from './Generic/GenericServiceData'
import ContainerService from './Container/ContainerService'
import ContainerServiceData from './Container/ContainerServiceData'

// Google
import GoogleAdminService from './Google/GoogleAdminService'
import GoogleAlloService from './Google/GoogleAlloService'
import GoogleAlloServiceData from './Google/GoogleAlloServiceData'
import GoogleAnalyticsService from './Google/GoogleAnalyticsService'
import GoogleCalendarService from './Google/GoogleCalendarService'
import GoogleCalendarServiceData from './Google/GoogleCalendarServiceData'
import GoogleChatService from './Google/GoogleChatService'
import GoogleChatServiceData from './Google/GoogleChatServiceData'
import GoogleClassroomService from './Google/GoogleClassroomService'
import GoogleContactsService from './Google/GoogleContactsService'
import GoogleDocsService from './Google/GoogleDocsService'
import GoogleDriveService from './Google/GoogleDriveService'
import GoogleFiService from './Google/GoogleFiService'
import GoogleHangoutsService from './Google/GoogleHangoutsService'
import GoogleHangoutsServiceData from './Google/GoogleHangoutsServiceData'
import GoogleInboxService from './Google/GoogleInboxService'
import GoogleInboxServiceData from './Google/GoogleInboxServiceData'
import GoogleKeepService from './Google/GoogleKeepService'
import GoogleMailService from './Google/GoogleMailService'
import GoogleMailServiceData from './Google/GoogleMailServiceData'
import GoogleMusicService from './Google/GoogleMusicService'
import GooglePhotosService from './Google/GooglePhotosService'
import GooglePlusService from './Google/GooglePlusService'
import GoogleSheetsService from './Google/GoogleSheetsService'
import GoogleSlidesService from './Google/GoogleSlidesService'
import GoogleVoiceService from './Google/GoogleVoiceService'
import GoogleYouTubeService from './Google/GoogleYouTubeService'

// Microsoft
import MicrosoftCalendarService from './Microsoft/MicrosoftCalendarService'
import MicrosoftContactsService from './Microsoft/MicrosoftContactsService'
import MicrosoftExcelService from './Microsoft/MicrosoftExcelService'
import MicrosoftMailService from './Microsoft/MicrosoftMailService'
import MicrosoftMailServiceData from './Microsoft/MicrosoftMailServiceData'
import MicrosoftOnedriveService from './Microsoft/MicrosoftOnedriveService'
import MicrosoftOnenoteService from './Microsoft/MicrosoftOnenoteService'
import MicrosoftPowerpointService from './Microsoft/MicrosoftPowerpointService'
import MicrosoftTasksService from './Microsoft/MicrosoftTasksService'
import MicrosoftTeamsService from './Microsoft/MicrosoftTeamsService'
import MicrosoftTeamsServiceData from './Microsoft/MicrosoftTeamsServiceData'
import MicrosoftTodoService from './Microsoft/MicrosoftTodoService'
import MicrosoftWordService from './Microsoft/MicrosoftWordService'

const MAPPING = {
  [SERVICE_TYPES.CONTAINER]: [ContainerService, ContainerServiceData],
  [SERVICE_TYPES.GENERIC]: [GenericService, GenericServiceData],
  [SERVICE_TYPES.SLACK]: [SlackService, SlackServiceData],
  [SERVICE_TYPES.TRELLO]: [TrelloService, TrelloServiceData],

  // Google
  [SERVICE_TYPES.GOOGLE_MAIL]: [GoogleMailService, GoogleMailServiceData],
  [SERVICE_TYPES.GOOGLE_INBOX]: [GoogleInboxService, GoogleInboxServiceData],
  [SERVICE_TYPES.GOOGLE_DRIVE]: [GoogleDriveService],
  [SERVICE_TYPES.GOOGLE_CONTACTS]: [GoogleContactsService],
  [SERVICE_TYPES.GOOGLE_KEEP]: [GoogleKeepService],
  [SERVICE_TYPES.GOOGLE_CALENDAR]: [GoogleCalendarService, GoogleCalendarServiceData],
  [SERVICE_TYPES.GOOGLE_PHOTOS]: [GooglePhotosService],
  [SERVICE_TYPES.GOOGLE_HANGOUTS]: [GoogleHangoutsService, GoogleHangoutsServiceData],
  [SERVICE_TYPES.GOOGLE_PLUS]: [GooglePlusService],
  [SERVICE_TYPES.GOOGLE_ANALYTICS]: [GoogleAnalyticsService],
  [SERVICE_TYPES.GOOGLE_YOUTUBE]: [GoogleYouTubeService],
  [SERVICE_TYPES.GOOGLE_ALLO]: [GoogleAlloService, GoogleAlloServiceData],
  [SERVICE_TYPES.GOOGLE_DOCS]: [GoogleDocsService],
  [SERVICE_TYPES.GOOGLE_SHEETS]: [GoogleSheetsService],
  [SERVICE_TYPES.GOOGLE_SLIDES]: [GoogleSlidesService],
  [SERVICE_TYPES.GOOGLE_MUSIC]: [GoogleMusicService],
  [SERVICE_TYPES.GOOGLE_ADMIN]: [GoogleAdminService],
  [SERVICE_TYPES.GOOGLE_FI]: [GoogleFiService],
  [SERVICE_TYPES.GOOGLE_CLASSROOM]: [GoogleClassroomService],
  [SERVICE_TYPES.GOOGLE_CHAT]: [GoogleChatService, GoogleChatServiceData],
  [SERVICE_TYPES.GOOGLE_VOICE]: [GoogleVoiceService],

  // Microsoft
  [SERVICE_TYPES.MICROSOFT_MAIL]: [MicrosoftMailService, MicrosoftMailServiceData],
  [SERVICE_TYPES.MICROSOFT_ONEDRIVE]: [MicrosoftOnedriveService],
  [SERVICE_TYPES.MICROSOFT_CONTACTS]: [MicrosoftContactsService],
  [SERVICE_TYPES.MICROSOFT_TASKS]: [MicrosoftTasksService],
  [SERVICE_TYPES.MICROSOFT_CALENDAR]: [MicrosoftCalendarService],
  [SERVICE_TYPES.MICROSOFT_WORD]: [MicrosoftWordService],
  [SERVICE_TYPES.MICROSOFT_EXCEL]: [MicrosoftExcelService],
  [SERVICE_TYPES.MICROSOFT_POWERPOINT]: [MicrosoftPowerpointService],
  [SERVICE_TYPES.MICROSOFT_ONENOTE]: [MicrosoftOnenoteService],
  [SERVICE_TYPES.MICROSOFT_TEAMS]: [MicrosoftTeamsService, MicrosoftTeamsServiceData],
  [SERVICE_TYPES.MICROSOFT_TODO]: [MicrosoftTodoService]
}

class ServiceFactory {
  /**
  * Gets the class for a service
  * @param type: the service type
  * @return the service class or undefined
  */
  static serviceClass (type) {
    const rec = MAPPING[type]
    return rec ? rec[0] : undefined
  }
  /**
  * Modelizes a service
  * @param data: the service data
  * @return the model version
  */
  static modelizeService (data) {
    const Class = this.serviceClass(data.type)
    if (Class) {
      return new Class(data)
    } else {
      return undefined
    }
  }

  /**
  * Modelizes a service data
  * @param data: the service data
  * @return the model version
  */
  static modelizeServiceData (data) {
    const Class = this.serviceDataClass(data.parentType)
    return new Class(data)
  }

  /**
  * Gets the class for service data
  * @param parentType: the parent type
  * @return the model class
  */
  static serviceDataClass (parentType) {
    const rec = MAPPING[parentType]
    if (rec && rec[1]) {
      return rec[1]
    } else {
      return CoreACServiceData
    }
  }
}

export default ServiceFactory
