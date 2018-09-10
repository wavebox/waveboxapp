import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import UISettings from 'shared/Models/Settings/UISettings'

class ServiceTabTools {
  /**
  * Get the classname for the given ui location
  * @param uiLocation: the ui location to get the classname for
  * @return a classname that can be applied to components
  */
  static uiLocationClassName (uiLocation) {
    switch (uiLocation) {
      case ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR:
        return 'sidelist'
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START:
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END:
        return 'toolbar'
    }
  }

  /**
  * Get sidebar size classname
  * @param sidebarsize: the sidebar size to get the classname for
  * @return a classname that can be applied to components
  */
  static sidebarSizeClassName (sidebarSize) {
    if (sidebarSize) {
      return `sidelist-${sidebarSize.toLowerCase()}`
    } else {
      return undefined
    }
  }

  /**
  * Get the ui positioning for the tooltip
  * @param uiLocation: the ui location to get the classname for
  * @return a set of props to apply to the tooltip
  */
  static uiLocationTooltipPositioning (uiLocation) {
    switch (uiLocation) {
      case ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR:
        return { position: 'right', arrow: 'center' }
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START:
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END:
        return { position: 'bottom', arrow: 'center' }
    }
  }

  /**
  * Get the axis for the given ui location
  * @param uiLocation: the ui location to get the axis for
  * @return the axix
  */
  static uiLocationAxis (uiLocation) {
    switch (uiLocation) {
      case ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR:
        return 'y'
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START:
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END:
        return 'x'
    }
  }

  /**
  * Get the serviceIds for the given ui location
  * @param uiLocation: the ui location to get the axis for
  * @param mailbox: the mailbox
  * @return the service ids
  */
  static uiLocationServiceIds (uiLocation, mailbox) {
    switch (uiLocation) {
      case ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR:
        return mailbox.sidebarFirstServicePriority !== ACMailbox.SIDEBAR_FIRST_SERVICE_PRIORITY.NORMAL
          ? mailbox.sidebarServices.slice(1)
          : mailbox.sidebarServices
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START:
        return mailbox.toolbarStartServices
      case ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END:
        return mailbox.toolbarEndServices
    }
  }

  /**
  * Looks to see if tooltips are enabled for the given ui location
  * @param uiLocation: the ui location to check for
  * @param the tooltip mode
  * @return true if tooltips are enabled, false otherwise
  */
  static uiLocationTooltipsEnabled (uiLocation, mode) {
    switch (mode) {
      case UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED:
        return true
      case UISettings.ACCOUNT_TOOLTIP_MODES.DISABLED:
        return false
      case UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY:
        return uiLocation === ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR
      case UISettings.ACCOUNT_TOOLTIP_MODES.TOOLBAR_ONLY:
        return uiLocation === ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START || uiLocation === ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END
    }
  }
}

export default ServiceTabTools
