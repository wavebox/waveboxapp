window.nativeRequire = function (name) {
  return require(name)
}

window.appNodeModulesRequire = function (name) {
  return require('../../app/node_modules/' + name)
}

window.appPackage = function () {
  return require('../../app/package.json')
}

window.mprocManager = function (name) {
  return require('../../app/app/MProcManagers/' + name)
}
