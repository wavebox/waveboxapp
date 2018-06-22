import CoreReducerManifest from '../CoreReducerManifest'
import ServiceReducer from './ServiceReducer'

const manifest = new CoreReducerManifest([
  ServiceReducer
])

export default manifest
