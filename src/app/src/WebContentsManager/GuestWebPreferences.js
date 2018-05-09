const PARENT_TO_CHILD_COPY_KEYS = [
  'affinity',
  'blinkFeatures',
  'contextIsolation',
  'disableBlinkFeatures',
  'experimentalCanvasFeatures',
  'experimentalFeatures',
  'images',
  'javascript',
  'nativeWindowOpen',
  'offscreen',
  'partition',
  'plugins',
  'sandbox',
  'scrollBounce',
  'sharedSiteInstances',
  'textAreasAreResizable',
  'webgl',
  'zoomFactor'
]

class GuestWebPreferences {
  /**
  * Sanitizes the webpreferences for guest use
  * @param webPreferences: the webPreferences to update
  * @return the given web preferences
  */
  static sanitizeForGuestUse (webPreferences) {
    webPreferences.nodeIntegration = false
    webPreferences.nodeIntegrationInWorker = false
    webPreferences.webviewTag = false
    webPreferences.allowRunningInsecureContent = false
    webPreferences.webSecurity = true
    return webPreferences
  }

  /**
  * Sets the default guest preferences if not already defined.
  * sanitizeForGuestUse will also be called
  * @param webPreferences: the web preferences to update
  * @return webPreferences
  */
  static defaultGuestPreferences (webPreferences) {
    if (webPreferences.contextIsolation === undefined) {
      webPreferences.contextIsolation = true
    }
    if (webPreferences.nativeWindowOpen === undefined) {
      webPreferences.nativeWindowOpen = true
    }
    if (webPreferences.plugins === undefined) {
      webPreferences.plugins = true
    }
    if (webPreferences.sandbox === undefined) {
      webPreferences.sandbox = true
    }
    if (webPreferences.sharedSiteInstances === undefined) {
      webPreferences.sharedSiteInstances = true
    }

    return this.sanitizeForGuestUse(webPreferences)
  }

  /**
  * Copies the parent prefernces into the child, but does some sanity checking
  * beforehand. If the parent uses node integration for example an error will be
  * thrown. sanitizeForGuestUse will also be called
  * @param parentWebPrefences: the webPreferences from the parent
  * @param childWebPreferences: the webPreferences to copy into
  * @return the updated child web prefernces
  */
  static copyForChild (parentWebPrefrences, childWebPreferences) {
    if (parentWebPrefrences.nodeIntegration === true) { throw new Error('Invalid parent webPreferences. nodeIntegration==true') }
    if (parentWebPrefrences.nodeIntegrationInWorker === true) { throw new Error('Invalid parent webPreferences. nodeIntegrationInWorker==true') }
    if (parentWebPrefrences.webviewTag === true) { throw new Error('Invalid parent webPreferences. webviewTag==true') }
    if (parentWebPrefrences.allowRunningInsecureContent === true) { throw new Error('Invalid parent webPreferences. allowRunningInsecureContent==true') }
    if (parentWebPrefrences.webSecurity === false) { throw new Error('Invalid parent webPreferences. webSecurity==false') }

    PARENT_TO_CHILD_COPY_KEYS.forEach((k) => {
      if (parentWebPrefrences[k] !== undefined) {
        childWebPreferences[k] = parentWebPrefrences[k]
      }
    })

    return this.sanitizeForGuestUse(childWebPreferences)
  }
}

export default GuestWebPreferences
