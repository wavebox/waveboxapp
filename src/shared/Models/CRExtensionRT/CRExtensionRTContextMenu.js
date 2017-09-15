const Model = require('../Model')

const ITEM_TYPES = Object.freeze({
  NORMAL: 'normal',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SEPERATOR: 'seperator'
})
const CONTEXT_TYPES = Object.freeze({
  ALL: 'all',
  PAGE: 'page',
  FRAME: 'frame',
  SELECTION: 'selection',
  LINK: 'link',
  EDITABLE: 'editable',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  LAUNCHER: 'launcher',
  BROWSER_ACTION: 'browser_action',
  PAGE_ACTION: 'page_action'
})

class CRExtensionRTContextMenu extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get CONTEXT_TYPES () { return CONTEXT_TYPES }
  static get ITEM_TYPES () { return ITEM_TYPES }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the owning extension
  * @param menuId: the id of the menu
  * @param data: the browserAction data
  */
  constructor (extensionId, menuId, data) {
    super(data)
    this.__extensionId__ = extensionId
    this.__menuId__ = menuId
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get extensionId () { return this.__extensionId__ }
  get id () { return this.__menuId__ }
  get parentId () { return this._value_('parentId') }
  get hasParent () { return !!this.parentId }
  get enabled () { return this._valueOfType_('enabled', 'boolean', true) }

  /* **************************************************************************/
  // Properties: Pattern matching
  /* **************************************************************************/

  get documentUrlPatters () { return this._valueOfType_('documentUrlPatterns', 'array', []) }
  get hasDocumentUrlPatters () { return this.documentUrlPatters && this.documentUrlPatters.length }
  get targetUrlPatterns () { return this._valueOfType_('targetUrlPatterns', 'array', []) }
  get hasTargetUrlPatterns () { return this.targetUrlPatterns && this.targetUrlPatterns.length }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get type () { return this._valueInStrObjEnum_('type', ITEM_TYPES, ITEM_TYPES.NORMAL) }
  get title () { return this._valueOfType_('title', 'string') }
  get checked () { return this._valueOfType_('checked', 'boolean', false) }

  /* **************************************************************************/
  // Properties: Context
  /* **************************************************************************/

  get contexts () { return this._valueOfType_('contexts', 'array', [CONTEXT_TYPES.PAGE]) }
}

module.exports = CRExtensionRTContextMenu
