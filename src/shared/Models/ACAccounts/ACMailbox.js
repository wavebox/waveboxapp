import CoreACModel from './CoreACModel'
import uuid from 'uuid'
import { URL } from 'url'

const USER_WINDOW_OPEN_MODES = Object.freeze({
  BROWSER: 'BROWSER',
  WAVEBOX: 'WAVEBOX',
  WAVEBOX_SERVICE_WINDOW: 'WAVEBOX_SERVICE_WINDOW',
  WAVEBOX_MAILBOX_WINDOW: 'WAVEBOX_MAILBOX_WINDOW',
  WAVEBOX_SERVICE_RUNNING_TAB: 'WAVEBOX_SERVICE_RUNNING_TAB',
  ASK: 'ASK',
  CUSTOM_PROVIDER: 'CUSTOM_PROVIDER'
})

const SERVICE_UI_LOCATIONS = Object.freeze({
  SIDEBAR: 'SIDEBAR',
  TOOLBAR_START: 'TOOLBAR_START',
  TOOLBAR_END: 'TOOLBAR_END'
})

const SERVICE_UI_PRIORITY = Object.freeze({
  AUTO: 'AUTO',
  SIDEBAR: 'SIDEBAR',
  TOOLBAR: 'TOOLBAR'
})

const SIDEBAR_FIRST_SERVICE_PRIORITY = Object.freeze({
  NORMAL: 'NORMAL',
  COLLAPSED: 'COLLAPSED',
  PRIMARY: 'PRIMARY'
})

const NAVIGATION_BAR_UI_LOCATIONS = Object.freeze({
  AUTO: 'AUTO',
  PRIMARY_TOOLBAR: 'PRIMARY_TOOLBAR',
  SECONDARY_TOOLBAR: 'SECONDARY_TOOLBAR'
})

class ACMailbox extends CoreACModel {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get USER_WINDOW_OPEN_MODES () { return USER_WINDOW_OPEN_MODES }
  static get SERVICE_UI_LOCATIONS () { return SERVICE_UI_LOCATIONS }
  static get NAVIGATION_BAR_UI_LOCATIONS () { return NAVIGATION_BAR_UI_LOCATIONS }
  static get SERVICE_UI_PRIORITY () { return SERVICE_UI_PRIORITY }
  static get SIDEBAR_FIRST_SERVICE_PRIORITY () { return SIDEBAR_FIRST_SERVICE_PRIORITY }

  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this mailbox
  * @param id=autogenerate: the id of the mailbox
  * @param displayName=undefined: the name to use when displaying this mailbox
  * @param color=undefined: the color of the mailbox
  * @param templateType=undefined: a template type that was used to create this mailbox
  * @return a vanilla js object representing the data for this mailbox
  */
  static createJS (id = uuid.v4(), displayName = undefined, color = undefined, templateType = undefined) {
    return {
      id: id,
      changedTime: new Date().getTime(),
      displayName: displayName,
      color: color,
      templateType: templateType
    }
  }

  /* **************************************************************************/
  // Class : Window opening
  /* **************************************************************************/

  /**
  * Standardizes a window open hostname
  * @param hostname: the hostname to Standardiz
  * @return the new hostname
  */
  static _standardizeWindowOpenHostname (hostname) {
    return hostname && hostname.startsWith('www.')
      ? hostname.replace('www.', '')
      : hostname
  }

  /**
  * Finds a all the window open querystring hostnames in a url
  * @param targetUrl: the parsed target url or raw url
  * @return a map of key to hostname
  */
  static _findWindowOpenQueryStringHostnames (targetUrl) {
    let pTargetUrl
    if (typeof (targetUrl) === 'object') {
      pTargetUrl = targetUrl
    } else {
      try {
        pTargetUrl = new URL(targetUrl)
      } catch (ex) {
        return new Map()
      }
    }

    return Array.from(pTargetUrl.searchParams.entries()).reduce((acc, [key, val]) => {
      try {
        acc.set(key, this._standardizeWindowOpenHostname(new URL(val).hostname))
      } catch (ex) { }
      return acc
    }, new Map())
  }

  /**
  * Generates a set of available match rules for a given url
  * @param targetUrl: the url to generate the rules for
  * @return an array of rules
  */
  static generateAvailableWindowOpenRulesForUrl (targetUrl) {
    let pRootUrl
    try {
      pRootUrl = new URL(targetUrl)
    } catch (ex) { return [] }

    // Match the root
    const rootHostname = this._standardizeWindowOpenHostname(pRootUrl.hostname)
    const matchRules = []
    matchRules.push({ hostname: rootHostname })

    // Look for query string arguments
    Array.from(this._findWindowOpenQueryStringHostnames(pRootUrl).entries()).forEach(([key, hostname]) => {
      matchRules.push({
        hostname: rootHostname,
        queryKey: key,
        queryHostname: hostname
      })
    })

    return matchRules
  }

  /**
  * Generates a set of available hostnames for a given url
  * @param targetUrl: the url to generate the hostnames for
  * @return an array of just hostnames
  */
  static generateAvailableWindowOpenHostnamesForUrl (targetUrl) {
    return this.generateAvailableWindowOpenRulesForUrl(targetUrl).map((rule) => {
      return rule.queryHostname || rule.hostname
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get partitionId () { return `persist:${this.id}` }
  get artificiallyPersistCookies () { return this._value_('artificiallyPersistCookies', false) }
  get templateType () { return this._value_('templateType', undefined) }

  /* **************************************************************************/
  // Properties: Services
  /* **************************************************************************/

  get sidebarServices () { return this._value_('sidebarServices', []) }
  get toolbarStartServices () { return this._value_('toolbarStartServices', []) }
  get toolbarEndServices () { return this._value_('toolbarEndServices', []) }
  get serviceUiPriority () { return this._value_('serviceUiPriority', SERVICE_UI_PRIORITY.AUTO) }
  get allServices () {
    let priority = this.serviceUiPriority
    if (priority === SERVICE_UI_PRIORITY.AUTO) {
      const sidebarWeight = this.sidebarServices.length
      const toolbarStartWeight = this.toolbarStartServices.length
      if (sidebarWeight !== 0 && toolbarStartWeight === 0) {
        priority = SERVICE_UI_PRIORITY.SIDEBAR
      } else {
        priority = SERVICE_UI_PRIORITY.TOOLBAR
      }
    }

    // Concat these in a visual way that makes sense in the UI
    if (priority === SERVICE_UI_PRIORITY.TOOLBAR) {
      const prioritizeFirstSidebarService = this.sidebarFirstServicePriority !== SIDEBAR_FIRST_SERVICE_PRIORITY.NORMAL
      return [].concat(
        prioritizeFirstSidebarService ? this.sidebarServices.slice(0, 1) : [],
        this.toolbarStartServices,
        this.toolbarEndServices,
        prioritizeFirstSidebarService ? this.sidebarServices.slice(1) : this.sidebarServices
      )
    } else { // SIDEBAR
      return [].concat(
        this.sidebarServices,
        this.toolbarStartServices,
        this.toolbarEndServices
      )
    }
  }
  get allServiceCount () {
    return this.toolbarStartServices.length +
    this.toolbarEndServices.length +
    this.sidebarServices.length
  }
  get hasServices () {
    return !!this.sidebarServices.length ||
      !!this.toolbarStartServices.length ||
      !!this.toolbarEndServices.length
  }
  get hasMultipleServices () { return this.allServiceCount > 1 }
  get hasSingleService () { return this.allServiceCount === 1 }
  get singleService () { return this.hasSingleService ? this.allServices[0] : undefined }

  /**
  * Checks if there is a service with the given id
  * @param serviceId: the id of the service
  * @return true if there is a service, false otherwise
  */
  hasServiceWithId (serviceId) {
    return !!this.allServices.find((id) => id === serviceId)
  }

  /**
  * Checks if there is a service with the given id in the sidebar
  * @param serviceId: the id of the service
  * @return true if there is a service, false otherwise
  */
  sidebarHasServiceWithId (serviceId) {
    return !!this.sidebarServices.find((id) => id === serviceId)
  }

  /**
  * Checks if there is a service with the given id in the toolbar start
  * @param serviceId: the id of the service
  * @return true if there is a service, false otherwise
  */
  toolbarStartHasServiceWithId (serviceId) {
    return !!this.toolbarStartServices.find((id) => id === serviceId)
  }

  /**
  * Checks if there is a service with the given id in the toolbar end
  * @param serviceId: the id of the service
  * @return true if there is a service, false otherwise
  */
  toolbarEndHasServiceWithId (serviceId) {
    return !!this.toolbarEndServices.find((id) => id === serviceId)
  }

  /**
  * Gets the ui location of a service with the given id
  * @param serviceId: the id of the service
  * @return the SERVICE_UI_LOCATIONS enum or undefined if not found
  */
  uiLocationOfServiceWithId (serviceId) {
    if (this.sidebarHasServiceWithId(serviceId)) {
      return SERVICE_UI_LOCATIONS.SIDEBAR
    } else if (this.toolbarStartHasServiceWithId(serviceId)) {
      return SERVICE_UI_LOCATIONS.TOOLBAR_START
    } else if (this.toolbarEndHasServiceWithId(serviceId)) {
      return SERVICE_UI_LOCATIONS.TOOLBAR_END
    } else {
      return undefined
    }
  }

  get suggestedServiceUILocation () {
    const weighted = [
      [SERVICE_UI_LOCATIONS.SIDEBAR, this.sidebarServices.length],
      [SERVICE_UI_LOCATIONS.TOOLBAR_END, this.toolbarEndServices.length]
    ].reduce((acc, [location, weight]) => {
      if (weight > acc[1]) {
        return [location, weight]
      } else {
        return acc
      }
    }, [SERVICE_UI_LOCATIONS.TOOLBAR_START, this.toolbarStartServices.length])
    return weighted[0]
  }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get displayName () { return this._value_('displayName', undefined) }
  get showExtendedDispayName () { return this._value_('showExtendedDispayName', true) }
  get avatarId () { return this._value_('avatarId', undefined) }
  get hasAvatarId () { return !!this.avatarId }
  get color () { return this._value_('color', undefined) }
  get showAvatarColorRing () { return this._value_('showAvatarColorRing', true) }
  get collapseSidebarServices () { return this._value_('collapseSidebarServices', false) }
  get sidebarFirstServicePriority () { return this._value_('sidebarFirstServicePriority', SIDEBAR_FIRST_SERVICE_PRIORITY.NORMAL) }
  get showSleepableServiceIndicator () { return this._value_('showSleepableServiceIndicator', true) }
  get navigationBarUiLocation () { return this._value_('navigationBarUiLocation', NAVIGATION_BAR_UI_LOCATIONS.AUTO) }

  /* **************************************************************************/
  // Properties : Badge
  /* **************************************************************************/

  get showBadge () { return this._value_('showBadge', true) }
  get badgeColor () { return this._value_('badgeColor', 'rgba(238, 54, 55, 0.95)') }

  /* **************************************************************************/
  // Properties : Useragent
  /* **************************************************************************/

  get useCustomUserAgent () { return this._value_('useCustomUserAgent', false) }
  get customUserAgentString () { return this._value_('customUserAgentString', '') }

  /* **************************************************************************/
  // Window opening
  /* **************************************************************************/

  get openDriveLinksWithExternalBrowser () { return this._value_('openGoogleDriveLinksWithExternalBrowser', false) }
  get userWindowOpenRules () { return this._value_('userWindowOpenRules', []) }

  get userNoMatchWindowOpenRule () {
    const val = this._value_('userNoMatchWindowOpenRule', undefined)
    if (val !== undefined) { return val }

    // Depricated value used to be one of BROWSER, WAVEBOX, ASK which map onto new values
    const depricated = this._value_('defaultWindowOpenMode', undefined)
    if (depricated && USER_WINDOW_OPEN_MODES[depricated]) { return { mode: depricated } }

    return { mode: USER_WINDOW_OPEN_MODES.ASK }
  }

  /**
  * Finds matching user window open rules for a given url
  * @param targetUrl: the url to find a match for
  * @return an array of matching rules
  */
  findMatchingUserWindowOpenRules (targetUrl) {
    if (this.userWindowOpenRules.length === 0) { return [] }

    let pTargetUrl
    try {
      pTargetUrl = new URL(targetUrl)
    } catch (ex) { return [] }
    const rootHostname = this.constructor._standardizeWindowOpenHostname(pTargetUrl.hostname)
    const qsHostnames = this.constructor._findWindowOpenQueryStringHostnames(pTargetUrl)

    return this.userWindowOpenRules.filter(({ rule }) => {
      if (rule.hostname !== rootHostname) { return false }
      if (rule.queryKey && qsHostnames.get(rule.queryKey) !== rule.queryHostname) { return false }
      return true
    })
  }

  /**
  * Finds matching window open rules for a given url within a subset of valid ids
  * @param targetUrl: the url to find a match for
  * @param validMailboxIds: an array of valid mailbox ids
  * @param validServiceIds: an array of valid service ids
  * @param validProviderIds: an array of valid provider ids
  * @return a valid rule, either from the user rules or the no match rule
  */
  resolveWindowOpenRule (targetUrl, validMailboxIds, validServiceIds, validProviderIds) {
    const mailboxIds = new Set(validMailboxIds)
    const serviceIds = new Set(validServiceIds)
    const providerIds = new Set(validProviderIds)
    const rule = this.findMatchingUserWindowOpenRules(targetUrl)
      .find(({ serviceId, mailboxId, providerId }) => {
        if (mailboxId && !mailboxIds.has(mailboxId)) {
          return false
        } else if (serviceId && !serviceIds.has(serviceId)) {
          return false
        } else if (providerId && !providerIds.has(providerId)) {
          return false
        } else {
          return true
        }
      })

    if (rule) {
      return rule
    } else {
      if (this.userNoMatchWindowOpenRule.mailboxId && !mailboxIds.has(this.userNoMatchWindowOpenRule.mailboxId)) {
        return { mode: USER_WINDOW_OPEN_MODES.ASK }
      } else if (this.userNoMatchWindowOpenRule.serviceId && !serviceIds.has(this.userNoMatchWindowOpenRule.serviceId)) {
        return { mode: USER_WINDOW_OPEN_MODES.ASK }
      } else if (this.userNoMatchWindowOpenRule.providerId && !providerIds.has(this.userNoMatchWindowOpenRule.providerId)) {
        return { mode: USER_WINDOW_OPEN_MODES.ASK }
      } else {
        return this.userNoMatchWindowOpenRule
      }
    }
  }

  get windowOpenModeOverrideRulesets () {
    if (this.openDriveLinksWithExternalBrowser) {
      return [
        {
          url: 'http(s)\\://(*.)google.com(/*)',
          matches: [
            { url: 'http(s)\\://docs.google.com(/*)', mode: 'EXTERNAL' },
            { url: 'http(s)\\://drive.google.com(/*)', mode: 'EXTERNAL' },
            { // Embedded google drive url
              url: 'http(s)\\://(*.)google.com(/*)',
              query: { q: 'http(s)\\://drive.google.com(/*)' },
              mode: 'EXTERNAL'
            },
            { // Embedded google docs url
              url: 'http(s)\\://(*.)google.com(/*)',
              query: { q: 'http(s)\\://docs.google.com(/*)' },
              mode: 'EXTERNAL'
            }
          ]
        }
      ]
    } else {
      return []
    }
  }
  get hasWindowOpenModeRulesetOverrides () { return this.windowOpenModeOverrideRulesets && this.windowOpenModeOverrideRulesets.length }

  get navigateModeOverrideRulesets () {
    if (this.openDriveLinksWithExternalBrowser) {
      return [
        {
          url: 'http(s)\\://*.google.com(/*)',
          matches: [
            // Convert content popup to external
            { windowType: 'CONTENT_POPUP', url: 'http(s)\\://docs.google.com/document/d/*/edit(*)', mode: 'CONVERT_TO_EXTERNAL' },
            { windowType: 'CONTENT_POPUP', url: 'http(s)\\://docs.google.com/spreadsheets/d/*/edit(*)', mode: 'CONVERT_TO_EXTERNAL' },
            { windowType: 'CONTENT_POPUP', url: 'http(s)\\://docs.google.com/presentation/d/*/edit(*)', mode: 'CONVERT_TO_EXTERNAL' }
          ]
        }
      ]
    } else {
      return []
    }
  }
  get hasNavigateModeOverrideRulesets () { return this.navigateModeOverrideRulesets && this.navigateModeOverrideRulesets.length }
}

export default ACMailbox
