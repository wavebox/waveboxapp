import CoreReducerManifest from '../CoreReducerManifest'
import ServiceDataReducer from './ServiceDataReducer'

import CoreGoogleMailServiceDataReducer from './CoreGoogleMailServiceDataReducer'
import ContainerServiceDataReducer from './ContainerServiceDataReducer'
import GenericServiceDataReducer from './GenericServiceDataReducer'
import GoogleAlloServiceDataReducer from './GoogleAlloServiceDataReducer'
import GoogleCalendarServiceDataReducer from './GoogleCalendarServiceDataReducer'
import GoogleHangoutsServiceDataReducer from './GoogleHangoutsServiceDataReducer'
import GoogleInboxServiceDataReducer from './GoogleInboxServiceDataReducer'
import GoogleMailServiceDataReducer from './GoogleMailServiceDataReducer'
import MicrosoftMailServiceDataReducer from './MicrosoftMailServiceDataReducer'
import MicrosoftTeamsServiceDataReducer from './MicrosoftTeamsServiceDataReducer'
import SlackServiceDataReducer from './SlackServiceDataReducer'
import TrelloServiceDataReducer from './TrelloServiceDataReducer'

const manifest = new CoreReducerManifest([
  ServiceDataReducer,

  CoreGoogleMailServiceDataReducer,
  ContainerServiceDataReducer,
  GenericServiceDataReducer,
  GoogleAlloServiceDataReducer,
  GoogleCalendarServiceDataReducer,
  GoogleHangoutsServiceDataReducer,
  GoogleInboxServiceDataReducer,
  GoogleMailServiceDataReducer,
  MicrosoftMailServiceDataReducer,
  MicrosoftTeamsServiceDataReducer,
  SlackServiceDataReducer,
  TrelloServiceDataReducer
])

export default manifest
