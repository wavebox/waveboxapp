import CoreReducerManifest from '../CoreReducerManifest'
import ServiceReducer from './ServiceReducer'

import GenericServiceData from './GenericServiceReducer'
import GoogleInboxServiceReducer from './GoogleInboxServiceReducer'
import GoogleMailServiceReducer from './GoogleMailServiceReducer'
import TrelloServiceReducer from './TrelloServiceReducer'

const manifest = new CoreReducerManifest([
  ServiceReducer,

  GenericServiceData,
  GoogleInboxServiceReducer,
  GoogleMailServiceReducer,
  TrelloServiceReducer
])

export default manifest
