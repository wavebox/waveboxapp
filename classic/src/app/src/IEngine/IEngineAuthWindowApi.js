import { EventEmitter } from 'events'
import pkg from 'package.json'
import IEngineApiLibs from './IEngineApiLibs'

class IEngineAuthWindowApi extends EventEmitter {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get appVersion () { return pkg.version }
  get platform () { return process.platform }
  get libs () { return IEngineApiLibs }

  /* **************************************************************************/
  // Modifiers
  /* **************************************************************************/

  loadUrl (targetUrl) { this.emit('load-url', targetUrl) }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  authSuccess (auth) { this.emit('auth-success', auth) }
  authFailure (ex) { this.emit('auth-failure') }
}

export default IEngineAuthWindowApi
