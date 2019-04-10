import { EventEmitter } from 'events'
import Resolver from 'Runtime/Resolver'
import fs from 'fs-extra'
import IEngineModuleLoader from 'shared/IEngine/IEngineModuleLoader'
import fetch from 'electron-fetch'
import pkg from 'package.json'
import { userStore } from 'stores/user'
import { IENGINE_AUTO_UPDATE_INTERVAL } from 'shared/constants'
import { IENGINE_TYPES } from 'shared/IEngine/IEngineTypes'

const SOURCE_TYPES = {
  PREBUILT: 'PREBUILT',
  LIVE: 'LIVE'
}

class IEngineLoader extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this._loadCaches = new Map()
    this._updatePoller = null
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads a string resource
  * @param iengineType: the type of iengine to load for
  * @param resource: the resource name
  * @return the resource string
  */
  loadStringResourceSync (iengineType, resource) {
    return this.loadResourceSync(iengineType, resource).toString('utf8')
  }

  /**
  * Loads a json resource
  * @param iengineType: the type of iengine to load for
  * @param resource: the resource name
  * @return the resource string
  */
  loadJSONResourceSync (iengineType, resource) {
    return JSON.parse(this.loadResourceSync(iengineType, resource).toString('utf8'))
  }

  /**
  * Loads a module sync
  * @param iengineType: the type of iengine to load for
  * @param resource: the resource name
  * @return the module
  */
  loadModuleSync (iengineType, resource) {
    const cache = this._ensureLoadCacheSync(iengineType)
    if (!cache.modules[resource]) {
      const moduleSource = fs.readFileSync(this._joinResourcePath(iengineType, cache.source, resource), 'utf8')
      const module = IEngineModuleLoader.loadModule(moduleSource)
      cache.modules[resource] = module
    }

    return cache.modules[resource]
  }

  /**
  * Loads a resource
  * @param iengineType: the type of iengine to load for
  * @param resource: the resource name
  * @return the resource buffer
  */
  loadResourceSync (iengineType, resource) {
    const source = this._ensureLoadCacheSync(iengineType).source
    return fs.readFileSync(this._joinResourcePath(iengineType, source, resource))
  }

  /**
  * Loads the version numbers sync
  * @return an object of name to current version
  */
  loadVersionNumbersSync () {
    return Array.from(IENGINE_TYPES).reduce((acc, type) => {
      acc[type] = this._ensureLoadCacheSync(type).version
      return acc
    }, {})
  }

  /* **************************************************************************/
  // Loading: Utils
  /* **************************************************************************/

  /**
  * Ensures the load cache is created
  * @param wbieName: the name of the module
  * @return the load cache
  */
  _ensureLoadCacheSync (wbieName) {
    if (!this._loadCaches.get(wbieName)) {
      this._loadCaches.set(wbieName, {
        ...this._getResourceSourceTypeSync(wbieName),
        modules: {}
      })
    }
    return this._loadCaches.get(wbieName)
  }

  /**
  * Gets the resource source type synchronously
  * @param wbieName: the name of the source type
  * @return { source: SOURCE_TYPE, version }
  */
  _getResourceSourceTypeSync (wbieName) {
    const versions = {
      [SOURCE_TYPES.PREBUILT]: -1,
      [SOURCE_TYPES.LIVE]: -1
    }
    try {
      versions[SOURCE_TYPES.PREBUILT] = fs.readJSONSync(Resolver.wbiePrebuilt(wbieName, 'manifest.json')).version
    } catch (ex) { }
    try {
      versions[SOURCE_TYPES.LIVE] = fs.readJSONSync(Resolver.wbieLive(wbieName, 'manifest.json')).version
    } catch (ex) { }

    if (versions[SOURCE_TYPES.LIVE] > versions[SOURCE_TYPES.PREBUILT]) {
      return { source: SOURCE_TYPES.LIVE, version: versions[SOURCE_TYPES.LIVE] }
    } else {
      return { source: SOURCE_TYPES.PREBUILT, version: versions[SOURCE_TYPES.PREBUILT] }
    }
  }

  /**
  * Resolves a path for a source type
  * @param wbieName: the name of the wbie
  * @param sourceType: the SOURCE_TYPE we're using to load
  * @param ...args: additional path arguments
  * @return a path to the resource
  */
  _joinResourcePath (wbieName, sourceType, ...args) {
    switch (sourceType) {
      case SOURCE_TYPES.PREBUILT:
        return Resolver.wbiePrebuilt(wbieName, ...args)
      case SOURCE_TYPES.LIVE:
        return Resolver.wbieLive(wbieName, ...args)
    }
  }

  /**
  * Clears the cache for a wbiename
  * @param wbieName: the name to clear
  */
  _clearCache (wbieName) {
    this._loadCaches.delete(wbieName)
  }

  /* **************************************************************************/
  // Extracting
  /* **************************************************************************/

  /**
  * Extracts a live pack file
  * @param wbieName: the wbie name
  * @param wbiePack: the pack file
  * @return promise
  */
  extractLivePackFile (wbieName, wbiePack) {
    return Promise.resolve()
      .then(() => fs.ensureDir(Resolver.wbieLive(wbieName)))
      .then(() => {
        return Object.keys(wbiePack.resources).reduce((acc, k) => {
          return acc
            .then(() => fs.writeFile(Resolver.wbieLive(wbieName, k), wbiePack.resources[k]))
        }, Promise.resolve())
      })
  }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Polls the server for updates
  */
  pollForUpdates () {
    clearInterval(this._updatePoller)
    this._updatePoller = setInterval(() => {
      this.fetchUpdateAndUnpack().catch((ex) => {
        console.warn(`Failed to fetch and unpack IEngine updates`, ex)
      })
    }, IENGINE_AUTO_UPDATE_INTERVAL)

    this.fetchUpdateAndUnpack().catch((ex) => {
      console.warn(`Failed to fetch and unpack IEngine updates`, ex)
    })
  }

  /**
  * Fetches update from the server
  * @return Promise
  */
  fetchUpdateAndUnpack () {
    return Promise.resolve()
      .then(() => {
        const clientId = userStore.getState().clientId
        return fetch(`https://waveboxio.com/updates/wbie/${clientId}/update.json`, {
          useElectronNet: true,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: pkg.version,
            channel: pkg.releaseChannel,
            wbie: this.loadVersionNumbersSync()
          })
        })
      })
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        const integrations = res.integrations
        const iengineTypes = Object.keys(integrations)
        if (iengineTypes.length) {
          return Promise.resolve()
            .then(() => {
              return iengineTypes.reduce((acc, type) => {
                return acc
                  .then(() => this.extractLivePackFile(type, integrations[type]))
                  .catch((ex) => {
                    console.warn(`Failed to unpack IEngine ${type}`, ex)
                    return Promise.resolve()
                  })
              }, Promise.resolve())
            })
            .then(() => Promise.resolve(iengineTypes))
        } else {
          return Promise.resolve([])
        }
      })
      .then((iengineTypes) => {
        iengineTypes.forEach((type) => {
          this._clearCache(type)
        })
        this.emit('reload-engines', { sender: this }, 'update', iengineTypes)
      })
  }
}

export default new IEngineLoader()
