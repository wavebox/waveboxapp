const Model = require('../../Model')
const ContainerService = require('./ContainerService')

class Container extends Model {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param id: the container id
  * @param data: the container data
  */
  constructor (id, data) {
    super(data)
    this.__id__ = id

    const serviceMetadata = this.buildServiceMetadata()
    this.__blankService__ = new ContainerService({}, serviceMetadata)
    this.__services__ = Object.keys(data.services || {}).reduce((acc, serviceType) => {
      acc[serviceType] = new ContainerService(data.services[serviceType], serviceMetadata)
      return acc
    }, {})
  }

  /**
  * Builds the metadata for a service
  */
  buildServiceMetadata () {
    return {
      name: this.name,
      hasUrlSubdomain: this.hasUrlSubdomain,
      logos: this.logos,
      logo: this.logo
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__id__ }
  get version () { return this.__data__.version || 0 }
  get minAppVersion () { return this.__data__.minAppVersion }

  /* **************************************************************************/
  // Properties: Install
  /* **************************************************************************/

  get postInstallUrl () { return this._value_('postInstallUrl', '') }
  get postInstallUrlDelay () { return this._value_('postInstallUrlDelay', 2500) }
  get hasPostInstallUrl () { return !!this.postInstallUrl }

  /* **************************************************************************/
  // Properties: Appearance
  /* **************************************************************************/

  get name () { return this._value_('name', 'Container') }
  get defaultColor () { return this._value_('defaultColor', 'rgb(255, 255, 255)') }
  get logos () { return this._value_('logos', []) }
  get logo () { return this.logos.slice(-1)[0] }

  /* **************************************************************************/
  // Properties: Subdomain
  /* **************************************************************************/

  get urlSubdomainName () { return this._value_('urlSubdomainName', 'subdomain') }
  get urlSubdomainHint () { return this._value_('urlSubdomainHint', '') }
  get hasUrlSubdomain () { return this._value_('hasUrlSubdomain', false) }

  /* **************************************************************************/
  // Properties: UA
  /* **************************************************************************/

  get userAgentString () { return this._value_('userAgentString', '') }
  get hasUserAgentString () { return !!this.userAgentString }

  /* **************************************************************************/
  // Properties: Window Opening
  /* **************************************************************************/

  get windowOpenOverrides () {
    return this._value_('windowOpenOverrides', [])
      .filter((ovr) => {
        if (!ovr.id) { return false }
        if (!ovr.label) { return false }

        let hasRules = false
        if (Array.isArray(ovr.rulesets) && ovr.rulesets.length) {
          hasRules = true
        } else if (Array.isArray(ovr.navigateRulesets) && ovr.navigateRulesets.length) {
          hasRules = true
        }
        if (!hasRules) { return false }

        return true
      })
  }
  get hasWindowOpenOverrides () { return Array.isArray(this.windowOpenOverrides) && this.windowOpenOverrides.length }

  /* **************************************************************************/
  // Properties: Service
  /* **************************************************************************/

  /**
  * @param serviceType: the service type
  * @return the defaults for the service type or an empty service defaults
  */
  serviceForType (serviceType) { return this.__services__[serviceType] || this.__blankService__ }

  /* **************************************************************************/
  // Cloning
  /* **************************************************************************/

  /**
  * Makes a clone of the data that can be injected into a mailbox
  */
  cloneForMailbox () { return this.cloneData() }
}

module.exports = Container
