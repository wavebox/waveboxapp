import CoreReducerManifest from '../CoreReducerManifest'
import AuthReducer from './AuthReducer'
import MicrosoftAuthReducer from './MicrosoftAuthReducer'

const manifest = new CoreReducerManifest([
  AuthReducer,
  MicrosoftAuthReducer
])

export default manifest
