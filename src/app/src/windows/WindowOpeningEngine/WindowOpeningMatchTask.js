import url from 'url'

const privCache = Symbol('privCache')

class WindowOpeningMatchTask {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param currentUrl: the current url
  * @param targetUrl: the target url to open
  * @param windowType: the window type that's opening
  * @param provisionalTargetUrl=undefined: the provisional target url the user is hovering over
  * @param disposition=undefined: the dispos of the new window
  * @param version: the version of the ruleset
  * @param ruleset: the raw ruleset
  */
  constructor (currentUrl, targetUrl, windowType, provisionalTargetUrl = undefined, disposition = undefined) {
    this.fullCurrentUrl = currentUrl
    this.fullTargetUrl = targetUrl
    this.windowType = windowType
    this.fullProvisionalTargetUrl = provisionalTargetUrl
    this.disposition = disposition
    this[privCache] = new Map()

    Object.freeze(this)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get hasProvisionalTargetUrl () { return !!this.fullProvisionalTargetUrl }

  get currentUri () {
    if (!this[privCache].has('currentUri')) {
      this[privCache].set('currentUri', this._justUri(this.fullCurrentUrl))
    }
    return this[privCache].get('currentUri')
  }

  get targetUri () {
    if (!this[privCache].has('targetUri')) {
      this[privCache].set('targetUri', this._justUri(this.fullTargetUrl))
    }
    return this[privCache].get('targetUri')
  }

  get targetUrlQuery () {
    if (!this[privCache].has('targetUrlQuery')) {
      this[privCache].set('targetUrlQuery', url.parse(this.fullTargetUrl, true).query)
    }
    return this[privCache].get('targetUrlQuery')
  }

  get provisionalTargetUri () {
    if (!this[privCache].has('provisionalTargetUri')) {
      this[privCache].set('provisionalTargetUri', this._justUri(this.fullProvisionalTargetUrl))
    }
    return this[privCache].get('provisionalTargetUri')
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @param targetUrl: a full url
  * @return a url without qs and hash
  */
  _justUri (targetUrl) {
    if (!targetUrl) { return targetUrl }
    return url.format({
      ...url.parse(targetUrl),
      hash: undefined,
      search: undefined,
      query: undefined
    })
  }
}

export default WindowOpeningMatchTask
