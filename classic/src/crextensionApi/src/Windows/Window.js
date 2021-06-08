import Tab from '../Tabs/Tab'

const privWindowId = Symbol('privWindowId')
const privRaw = Symbol('privRaw')
const privTabs = Symbol('privTabs')

class Window {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/extensions/windows#type-Window
  * @param windowIdOrTabData: the id of the tab or the raw tab data
  * @param raw={}: the raw tab config if the tab id is supplied as the first argument
  */
  constructor (windowIdOrTabData, raw = {}) {
    if (typeof (windowIdOrTabData) === 'object') {
      this[privWindowId] = windowIdOrTabData.id
      this[privRaw] = windowIdOrTabData
    } else {
      this[privWindowId] = windowIdOrTabData
      this[privRaw] = raw
    }
    this[privTabs] = (this[privRaw].tabs || [])
      .map((tabData) => new Tab(tabData))

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this[privWindowId] }
  get focused () { return this[privRaw].focused }
  get top () { return this[privRaw].top }
  get left () { return this[privRaw].left }
  get width () { return this[privRaw].width }
  get height () { return this[privRaw].height }
  get incognito () { return this[privRaw].incognito }
  get alwaysOnTop () { return this[privRaw].alwaysOnTop }
  get type () { return this[privRaw].type }
  get tabs () { return this[privTabs] }
}

export default Window
