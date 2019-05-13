import CoreACServiceData from '../CoreACServiceData'

class IEngineServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get etag () { return this._value_('etag', undefined) }
  get hasEtag () { return this.etag !== undefined && this.etag !== null }

  /* **************************************************************************/
  // Properties: Unread
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get trayMessages () { return this._value_('trayMessages', []) }
  get notifications () { return this._value_('notifications', []) }

  /* **************************************************************************/
  // Properties: Expando
  /* **************************************************************************/

  get expando () { return this._value_('expando', {}) }

  /**
  * Gets a value from the expando model
  * @param key: the key to get
  * @param defaultValue=undefined: the default value if none is found
  * @return the value
  */
  getExpandoValue (key, defaultValue = undefined) {
    return this.expando[key] === undefined
      ? defaultValue
      : this.expando[key]
  }

  /**
  * Gets a value from the expando model ensuring type first
  * @param key: the key to get
  * @param type: the type (also supports pseudo array)
  * @param defaultValue=undefined: the default value if none is found or malformed type
  * @return the value
  */
  shapeExpandoValue (key, type, defaultValue = undefined) {
    const raw = this.expando[key]
    const rawType = typeof (raw)
    return (type === rawType) || (type === 'array' && Array.isArray(raw))
      ? raw
      : defaultValue
  }
}

export default IEngineServiceData
