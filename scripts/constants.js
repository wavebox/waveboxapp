const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')
const SRC_DIR = path.join(ROOT_DIR, 'src')
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const CACHES_DIR = path.join(ROOT_DIR, '.caches')
const PKG = require(path.join(ROOT_DIR, 'package.json'))
const ASSETS_DIR = path.join(ROOT_DIR, 'assets')
const LOCAL_SCRIPTS_DIR = path.join(ROOT_DIR, '.localscripts')

module.exports = {
  ROOT_DIR: ROOT_DIR,
  SRC_DIR: SRC_DIR,
  BIN_DIR: BIN_DIR,
  CACHES_DIR: CACHES_DIR,
  ASSETS_DIR: ASSETS_DIR,
  LOCAL_SCRIPTS_DIR: LOCAL_SCRIPTS_DIR,
  PKG: PKG,
  PACKAGE_DIRS: [
    ROOT_DIR,
    path.join(SRC_DIR, 'app'),
    path.join(SRC_DIR, 'guest'),
    path.join(SRC_DIR, 'crextensionApi'),
    path.join(SRC_DIR, 'scenes/mailboxes'),
    path.join(SRC_DIR, 'scenes/content'),
    path.join(SRC_DIR, 'scenes/monitor'),
    path.join(SRC_DIR, 'scenes/print'),
    path.join(SRC_DIR, 'scenes/keychain'),
    path.join(SRC_DIR, 'scenes/traypopout')
  ],
  REBUILD_PACKAGE_DIRS: [
    path.join(SRC_DIR, 'app')
  ]
}
