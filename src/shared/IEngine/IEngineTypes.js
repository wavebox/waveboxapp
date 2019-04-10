import SERVICE_TYPES from '../Models/ACAccounts/ServiceTypes'

const SERVICE_TYPES_TO_WBIE_NAME = Object.freeze({
  [SERVICE_TYPES.GOOGLE_MAIL]: 'gmail'
})
const WBIE_NAMES_TO_SERVICE_TYPE = Object.freeze(
  Object.keys(SERVICE_TYPES_TO_WBIE_NAME).reduce((acc, k) => {
    acc[SERVICE_TYPES_TO_WBIE_NAME[k]] = k
    return acc
  }, {})
)
const SUPPORTED_WBIE_TYPES = new Set(Object.keys(WBIE_NAMES_TO_SERVICE_TYPE))
const SUPPORTED_WBIE_SERVICE_TYPES = new Set(Object.keys(SERVICE_TYPES_TO_WBIE_NAME))

export {
  SERVICE_TYPES_TO_WBIE_NAME,
  WBIE_NAMES_TO_SERVICE_TYPE,
  SUPPORTED_WBIE_SERVICE_TYPES,
  SUPPORTED_WBIE_TYPES
}
