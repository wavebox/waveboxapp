const CoreMailbox = require('../CoreMailbox')
const MailboxColors = require('../MailboxColors')
const Container = require('../../Container/Container')
const ServiceFactory = require('../ServiceFactory')

class ContainerMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.CONTAINER }

  static get humanizedType () { return 'Container' }
  static get defaultColor () { return MailboxColors.CONTAINER }
  static get isIntegrated () { return false }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param id: the id ofthe tab
  * @param data: the data of the tab
  */
  constructor (id, data) {
    const containerData = data.container || {}
    const container = new Container(containerData.id, containerData)
    super(id, data, { __container__: container })
  }

  /**
  * @override
  */
  modelizeService (serviceData) {
    return ServiceFactory.modelize(
      this.id,
      this.type,
      serviceData,
      {
        container: this.container,
        urlSubdomain: this.urlSubdomain
      },
      this.buildMailboxToServiceMigrationData(serviceData.type)
    )
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get container () { return this.__container__ }
  get containerId () { return this.container.id }
  get containerVersion () { return this.container.version }

  /* **************************************************************************/
  // Properties : Humanized
  /* **************************************************************************/

  get humanizedType () { return this.container.name }
  get humanizedLogos () { return this.container.logos }
  get humanizedLogo () { return this.container.logo }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get color () {
    const superColor = super.color
    return superColor || this.container.defaultColor || this.constructor.defaultColor
  }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUrlSubdomain () { return this.container.hasUrlSubdomain }
  get urlSubdomain () { return this._value_('urlSubdomain', '') }
  get displayName () { return this.userDisplayName || this.container.name }
  get userDisplayName () { return this._value_('displayName', '') }

  /* **************************************************************************/
  // Properties : Useragent
  /* **************************************************************************/

  get useCustomUserAgent () {
    const overwrite = this._value_('useCustomUserAgent', null)
    if (overwrite === undefined || overwrite === null) {
      return this.container.hasUserAgentString
    } else {
      return overwrite
    }
  }
  get customUserAgentString () {
    const overwrite = this._value_('customUserAgentString', null)
    if (overwrite === undefined || overwrite === null || overwrite.trim() === '') {
      return this.container.userAgentString
    } else {
      return overwrite
    }
  }

  /* **************************************************************************/
  // Properties: Window Opening
  /* **************************************************************************/

  get enabledWindowOpenOverrideConfigs () {
    const userConfigs = this.windowOpenUserConfig
    return this.container.windowOpenOverrides
      .filter((ovr) => {
        if (userConfigs[ovr.id] !== undefined) { return userConfigs[ovr.id] }
        if (ovr.defaultValue) { return true }
        return false
      })
  }

  get windowOpenModeOverrideRulesets () {
    return this.enabledWindowOpenOverrideConfigs.reduce((acc, ovr) => acc.concat(ovr.rulesets), [])
  }
  get navigateModeOverrideRulesets () {
    return this.enabledWindowOpenOverrideConfigs.reduce((acc, ovr) => acc.concat(ovr.navigateRulesets), [])
  }

  get windowOpenUserConfig () { return this._value_('windowOpenUserConfig', {}) }

  /**
  * Gets the user configuration for all the ruleset returning id, label and value
  * @return an array of { id, label, value }
  */
  getAllWindowOpenOverrideUserConfigs () {
    const userConfigs = this.windowOpenUserConfig
    return this.container.windowOpenOverrides.map((ovr) => {
      let value
      if (userConfigs[ovr.id] !== undefined) {
        value = userConfigs[ovr.id]
      } else if (ovr.defaultValue !== undefined) {
        value = ovr.defaultValue
      } else {
        value = false
      }
      return { id: ovr.id, label: ovr.label, value: value }
    })
  }
}

module.exports = ContainerMailbox
