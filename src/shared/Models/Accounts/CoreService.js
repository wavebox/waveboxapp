const Model = require('../Model')
const SERVICE_TYPES = require('./ServiceTypes')
const PROTOCOL_TYPES = require('./ProtocolTypes')
const { MAILBOX_SLEEP_WAIT } = require('../../constants')

class CoreService extends Model {
  /* **************************************************************************/
  // Class: Config & Types
  /* **************************************************************************/

  static get SERVICE_TYPES () { return SERVICE_TYPES }
  static get PROTOCOL_TYPES () { return PROTOCOL_TYPES }
  static get type () { return SERVICE_TYPES.UNKNOWN }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return undefined }
  static get humanizedLogos () { return [] }
  static get humanizedLogo () { return this.humanizedLogos[this.humanizedLogos.length - 1] }

  /* **************************************************************************/
  // Class: Creation
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this service
  * @return a vanilla js object representing the data for this service
  */
  static createJS () {
    return { type: this.type }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param parentId: the id of the mailbox
  * @param data: the data of the service
  * @param metadata={}: metadata for this service to use
  */
  constructor (parentId, data, metadata = {}) {
    super(data)
    this.__parentId__ = parentId
    this.__metadata__ = metadata
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get parentId () { return this.__parentId__ }
  get type () { return this.constructor.type }
  get url () { return undefined }
  get sleepable () { return this._value_('sleepable', true) }
  get sleepableTimeout () { return this._value_('sleepableTimeout', MAILBOX_SLEEP_WAIT) }

  /* **************************************************************************/
  // Properties: Protocols & actions
  /* **************************************************************************/

  get supportedProtocols () { return new Set() }
  get supportsCompose () { return false }

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return this.constructor.humanizedType }
  get humanizedLogos () { return this.constructor.humanizedLogos }
  get humanizedLogo () { return this.constructor.humanizedLogo }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get zoomFactor () { return this._value_('zoomFactor', 1.0) }

  /* **************************************************************************/
  // Properties : Custom injectables
  /* **************************************************************************/

  get customCSS () { return this.__data__.customCSS }
  get hasCustomCSS () { return !!this.customCSS }
  get customJS () { return this.__data__.customJS }
  get hasCustomJS () { return !!this.customJS }
}

module.exports = CoreService
