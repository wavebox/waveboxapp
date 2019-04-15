import CoreReducerManifest from '../CoreReducerManifest'
import ServiceDataReducer from './ServiceDataReducer'

import ContainerServiceDataReducer from './ContainerServiceDataReducer'
import GenericServiceDataReducer from './GenericServiceDataReducer'
import GoogleAlloServiceDataReducer from './GoogleAlloServiceDataReducer'
import GoogleCalendarServiceDataReducer from './GoogleCalendarServiceDataReducer'
import GoogleHangoutsServiceDataReducer from './GoogleHangoutsServiceDataReducer'
import IEngineServiceDataReducer from './IEngineServiceDataReducer'
import MicrosoftMailServiceDataReducer from './MicrosoftMailServiceDataReducer'
import MicrosoftTeamsServiceDataReducer from './MicrosoftTeamsServiceDataReducer'
import SlackServiceDataReducer from './SlackServiceDataReducer'

const manifest = new CoreReducerManifest([
  ServiceDataReducer,

  ContainerServiceDataReducer,
  GenericServiceDataReducer,
  GoogleAlloServiceDataReducer,
  GoogleCalendarServiceDataReducer,
  GoogleHangoutsServiceDataReducer,
  IEngineServiceDataReducer,
  MicrosoftMailServiceDataReducer,
  MicrosoftTeamsServiceDataReducer,
  SlackServiceDataReducer
])

export default manifest
