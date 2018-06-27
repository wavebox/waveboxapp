//DEV only

const logger = {
  get: (target, name) => {
    let names = []
    let insp = target.constructor.prototype
    while (insp !== null) {
      names = names.concat(Object.getOwnPropertyNames(insp))
      insp = Object.getPrototypeOf(insp)
    }
    names = names.concat(Object.getOwnPropertyNames(target))

    const propertyNames = new Set(names)
    if (!propertyNames.has(name)) {
      console.warn(`WARN: undefined prop name on "${target.constructor.name}" "${name}"`)
    }
    return target[name]
  }
}

module.exports = function (inst) {
  return new Proxy(inst, logger)
}
