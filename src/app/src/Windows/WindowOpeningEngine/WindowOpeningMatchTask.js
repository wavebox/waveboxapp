import { URL, format as urlFormat } from 'url'

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
    this.fullCurrentUrl = currentUrl || 'about:blank'
    this.fullTargetUrl = targetUrl || 'about:blank'
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
      const searchParams = new URL(this.fullTargetUrl).searchParams
      const query = Array.from(searchParams.entries()).reduce((acc, [k, v]) => {
        acc[k] = v
        return acc
      }, {})
      this[privCache].set('targetUrlQuery', query)
    }
    return this[privCache].get('targetUrlQuery')
  }

  get targetUrlHash () {
    if (!this[privCache].has('targetUrlHash')) {
      this[privCache].set('targetUrlHash', new URL(this.fullTargetUrl).hash)
    }
    return this[privCache].get('targetUrlHash')
  }

  get provisionalTargetUri () {
    if (!this[privCache].has('provisionalTargetUri')) {
      this[privCache].set('provisionalTargetUri', this._justUri(this.fullProvisionalTargetUrl))
    }
    return this[privCache].get('provisionalTargetUri')
  }

  get provisionalTargetUrlHash () {
    if (!this[privCache].has('provisionalTargetUrlHash')) {
      this[privCache].set('provisionalTargetUrlHash', new URL(this.fullProvisionalTargetUrl).hash)
    }
    return this[privCache].get('provisionalTargetUrlHash')
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
    const purl = new URL(targetUrl)
    return urlFormat({
      protocol: purl.protocol,
      hostname: purl.hostname,
      pathname: purl.pathname
    })
  }
}

export default WindowOpeningMatchTask
