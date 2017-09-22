window.appNodeModulesRequire = function (name) {
  return require('../../app/node_modules/' + name)
}

window.mprocManager = function (name) {
  return require('../../app/app/MProcManagers/' + name)
}

window.guestResolve = function (name) {
  const path = require('path')
  return path.join('../../guest/guest/', name)
}

window.distributionConfig = function () {
  try {
    return require('../../app/distributionConfig.json')
  } catch (ex) {
    return {}
  }
}

window.iconResolve = function (name) {
  const path = require('path')
  return path.join(path.dirname(window.location.pathname), '../../icons', name)
}
