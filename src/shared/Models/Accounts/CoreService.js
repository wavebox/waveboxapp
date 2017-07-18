const Model = require('../Model')
const SERVICE_TYPES = require('./ServiceTypes')
const PROTOCOL_TYPES = require('./ProtocolTypes')
const { MAILBOX_SLEEP_WAIT } = require('../../constants')

const WINDOW_OPEN_MODES = Object.freeze({
  CONTENT: 'CONTENT',
  CONTENT_PROVSIONAL: 'CONTENT_PROVSIONAL',
  POPUP_CONTENT: 'POPUP_CONTENT',
  EXTERNAL: 'EXTERNAL',
  EXTERNAL_PROVSIONAL: 'EXTERNAL_PROVSIONAL',
  DEFAULT: 'DEFAULT',
  DOWNLOAD: 'DOWNLOAD',
  SUPPRESS: 'SUPPRESS'
})

const RELOAD_BEHAVIOURS = Object.freeze({
  RELOAD: 'RELOAD',
  RESET_URL: 'RESET_URL'
})

class CoreService extends Model {
  /* **************************************************************************/
  // Class: Config & Types
  /* **************************************************************************/

  static get WINDOW_OPEN_MODES () { return WINDOW_OPEN_MODES }
  static get SERVICE_TYPES () { return SERVICE_TYPES }
  static get PROTOCOL_TYPES () { return PROTOCOL_TYPES }
  static get RELOAD_BEHAVIOURS () { return RELOAD_BEHAVIOURS }
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
  get hasNavigationToolbar () { return false }
  get reloadBehaviour () { return RELOAD_BEHAVIOURS.RELOAD }

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

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @param provisionalTargetUrl: the provisional target url that the user may be hovering over or have highlighted
  * @param parsedProvisionalTargetUrl: the provisional target parsed by nodejs url
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl) {
    if (disposition === 'background-tab') {
      return WINDOW_OPEN_MODES.EXTERNAL
    } else if (disposition === 'new-window' || url === 'about:blank') {
      return WINDOW_OPEN_MODES.POPUP_CONTENT
    } else if (disposition === 'save-to-disk') {
      return WINDOW_OPEN_MODES.DOWNLOAD
    } else {
      return WINDOW_OPEN_MODES.DEFAULT
    }
  }
}

module.exports = CoreService
