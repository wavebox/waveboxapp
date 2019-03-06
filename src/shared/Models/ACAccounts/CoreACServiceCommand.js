import Model from '../Model'

class CoreACServiceCommand extends Model {
  /* **************************************************************************/
  // Properties: SAPI
  /* **************************************************************************/

  get isSAPI () { return this._value_('isSAPI', false) }

  /* **************************************************************************/
  // Properties: Match
  /* **************************************************************************/

  get modifier () { return this._value_('modifier', undefined) }
  get keyword () { return this._value_('keyword', undefined) }
  get helper () { return this._value_('helper', undefined) }
  get description () { return this._value_('description', undefined) }

  /* **************************************************************************/
  // Properties: Action
  /* **************************************************************************/

  get url () { return this._value_('url', undefined) }
  get hasUrl () { return !!this.url }

  /**
  * Injects the args into the url
  * @param args: the args string to use
  * @return the url with the args injected
  */
  templateUrl (args) {
    if (this.hasUrl) {
      return this.url.replace(/{{args}}/g, encodeURIComponent(args))
    } else {
      return undefined
    }
  }

  get JS () { return this._value_('js', undefined) }
  get hasJS () { return !!this.JS }
}

export default CoreACServiceCommand
