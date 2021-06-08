import { URL } from 'url'

const privData = Symbol('privData')
const privUrl = Symbol('privUrl')

export default class HtmlMetaResult {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param url: the url this result would be for
  */
  constructor (url) {
    this[privUrl] = url
    this[privData] = {
      title: null,
      favicon: null
    }
  }

  /* ****************************************************************************/
  // Properties: Meta
  /* ****************************************************************************/

  get title () { return this[privData].title }
  set title (val) {
    if (!val) { return }
    if (this.title) { return }
    this[privData].title = val
  }
  get favicon () { return this[privData].favicon }
  set favicon (val) {
    if (!val) { return }
    if (this.favicon) { return }
    try {
      this[privData].favicon = new URL(val, this[privUrl]).href
    } catch (ex) { /* no-op */ }
  }

  /* ****************************************************************************/
  // Properties: Global
  /* ****************************************************************************/

  get toJS () {
    return {
      ...this[privData],
      url: this[privUrl]
    }
  }
  get hasMissing () {
    return Object
      .keys(this[privData])
      .findIndex((k) => this[privData][k] === null) !== -1
  }
}
