const privRaw = Symbol('privRaw')

class Cookie {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/cookies#type-Cookie
  * @param raw: the raw cookie json
  */
  constructor (raw) {
    this[privRaw] = raw

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get name () { return this[privRaw].name }
  get value () { return this[privRaw].value }
  get domain () { return this[privRaw].domain }
  get hostOnly () { return this[privRaw].hostOnly }
  get path () { return this[privRaw].path }
  get secure () { return this[privRaw].secure }
  get httpOnly () { return this[privRaw].httpOnly }
  get session () { return this[privRaw].session }
  get expirationDate () { return this[privRaw].expirationDate }
}

export default Cookie
