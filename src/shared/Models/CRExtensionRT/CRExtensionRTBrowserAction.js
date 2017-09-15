const Model = require('../Model')

class CRExtensionRTBrowserAction extends Model {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the owning extension
  * @param tabId: the id of the tab
  * @param data: the browserAction data
  */
  constructor (extensionId, tabId, data) {
    super(data)
    this.__extensionId__ = extensionId
    this.__tabId__ = tabId
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get extensionId () { return this.__extensionId__ }
  get tabId () { return this.__tabId__ }
  get isGlobal () { return !this.tabId }
  get enabled () { return this._valueOfType_('enabled', 'boolean', true) }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get title () { return this._valueOfType_('title', 'string') }
  get icon () { return this._value_('icon') }

  /* **************************************************************************/
  // Properties: Badge
  /* **************************************************************************/

  get badgeText () { return this._value_('badgeText') }
  get hasBadge () { return !!this.badgeText }
  get badgeBackgroundColor () { return this._value_('badgeBackgroundColor') }
}

module.exports = CRExtensionRTBrowserAction
