import Model from '../Model'
import { COMMAND_PALETTE_VALID_MODIFIERS } from '../../constants'

let validationRules

class ACContainerSAPI extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Validates the raw data, checking types and required fields
  * @param Joi: the joi validation library
  * @param data: the data to check
  * @return { hasErrors, errors } boolean for if there are errors, an array of errors
  */
  static validateData (Joi, data) {
    if (!validationRules) {
      // Lazily create these
      validationRules = {
        supportsUnreadActivity: Joi.boolean().optional(),
        supportsUnreadCount: Joi.boolean().optional(),
        supportsTrayMessages: Joi.boolean().optional(),
        supportsWBGAPI: Joi.boolean().optional(),
        supportsGuestNotifications: Joi.boolean().optional(),

        adaptors: Joi.array().optional().items(Joi.object({
          matches: Joi.array().required().items(
            Joi.string().min(1)
          ),
          js: Joi.string().optional().min(1),
          styles: Joi.string().optional().min(1)
        })),
        commands: Joi.array().optional().items(Joi.object({
          modifier: Joi.string().valid(Array.from(COMMAND_PALETTE_VALID_MODIFIERS)).required(),
          keyword: Joi.string().min(2).required(),
          helper: Joi.string().min(1).required(),
          description: Joi.string().min(1).required(),
          url: Joi.string().optional(),
          js: Joi.string().min(1).optional()
        })),

        useAsyncAlerts: Joi.boolean().optional(),
        html5NotificationsGenerateUnreadActivity: Joi.boolean().optional(),
        documentTitleHasUnread: Joi.boolean().optional(),
        documentTitleUnreadBlinks: Joi.boolean().optional(),
        faviconUnreadActivityRegexp: Joi.string().min(1).optional()
      }
    }

    const result = Joi.validate(data, validationRules, { abortEarly: false, convert: false })
    if (result.error) {
      return {
        hasErrors: true,
        errors: result.error.details.map((err) => {
          return `${err.path.join('/')}: ${err.message}`
        })
      }
    } else {
      return { hasErrors: false, errors: [] }
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (...props) {
    super(...props)

    this.__cachedAdaptors__ = undefined
    this.__cachedCommands__ = undefined
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hasConfig () { return Object.keys(this.__data__).length !== 0 }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  getSupportsUnreadActivity (defaultValue) { return this._value_('supportsUnreadActivity', defaultValue) }
  getSupportsUnreadCount (defaultValue) { return this._value_('supportsUnreadCount', defaultValue) }
  getSupportsTrayMessages (defaultValue) { return this._value_('supportsTrayMessages', defaultValue) }
  getSupportsGuestNotifications (defaultValue) { return this._value_('supportsGuestNotifications', defaultValue) }
  getSupportsWBGAPI (defaultValue) { return this._value_('supportsWBGAPI', defaultValue) }

  /* **************************************************************************/
  // Properties: Adaptor
  /* **************************************************************************/

  getAdaptors (others) {
    const raw = this._value_('adaptors')
    if (raw) {
      // We patch the adaptors so we can detect a disk load
      if (!this.__cachedAdaptors__) {
        this.__cachedAdaptors__ = raw.map((adaptor) => {
          return { ...adaptor, isSAPI: true }
        })
      }
      return [].concat(this.__cachedAdaptors__, others)
    } else {
      return others
    }
  }

  /* **************************************************************************/
  // Properties: Commands
  /* **************************************************************************/

  getCommands (others) {
    const raw = this._value_('commands')
    if (raw) {
      // We patch the adaptors so we can detect a disk load
      if (!this.__cachedCommands__) {
        this.__cachedCommands__ = raw.map((command) => {
          return { ...command, isSAPI: true }
        })
      }
      return [].concat(this.__cachedCommands__, others)
    } else {
      return others
    }
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  getUseAsyncAlerts (defaultValue) { return this._value_('useAsyncAlerts', defaultValue) }
  getHtml5NotificationsGenerateUnreadActivity (defaultValue) { return this._value_('html5NotificationsGenerateUnreadActivity', defaultValue) }

  /* **************************************************************************/
  // Properties: Unread
  /* **************************************************************************/

  getDocumentTitleHasUnread (defaultValue) { return this._value_('documentTitleHasUnread', defaultValue) }
  getDocumentTitleUnreadBlinks (defaultValue) { return this._value_('documentTitleUnreadBlinks', defaultValue) }
  getFaviconUnreadActivityRegexp (defaultValue) { return this._value_('faviconUnreadActivityRegexp', defaultValue) }

  /* **************************************************************************/
  // Cloning
  /* **************************************************************************/

  /**
  * Makes a clone of the data that can be injected into a mailbox
  */
  cloneForService () { return this.cloneData() }
}

export default ACContainerSAPI
