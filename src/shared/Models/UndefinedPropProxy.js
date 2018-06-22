//DEV only

const logger = {
  get: (target, name) => {
    const propertyNames = new Set(Object.getOwnPropertyNames(target.constructor.prototype))
    if (!propertyNames.has(name)) {
      console.log(`WARN: undefined prop name on "${target.constructor.name}" "${name}"`)
    }
    return target[name]
  }
}

module.exports = function (inst) {
  return new Proxy(inst, logger)
}
