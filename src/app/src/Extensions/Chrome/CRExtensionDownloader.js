import fs from 'fs-extra'
import decompress from 'decompress'
import crxunzip from 'unzip-crx'
import path from 'path'
import uuid from 'uuid'
import querystring from 'querystring'
import { URL } from 'url'
import {
  CRExtensionVersionParser
} from 'shared/Models/CRExtension'
import RuntimePaths from 'Runtime/RuntimePaths'
import { userStore } from 'stores/user'
import semver from 'semver'
import CRExtensionFS from './CRExtensionFS'
import fetch from 'electron-fetch'
import pkg from 'package.json'

const xml2js = require('xml2js') // doesn't play nicely with import - defines defaults

class CRExtensionDownloader {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.downloads = new Map()
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get downloadingExtensionIds () { return Array.from(this.downloads.keys()) }
  get cwsProdVersion () { return process.versions.chrome.split('.').slice(0, 2).join('.') }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @return true if there is an in progress download
  */
  hasInProgressDownload (extensionId) { return this.downloads.has(extensionId) }

  /* ****************************************************************************/
  // Downloading
  /* ****************************************************************************/

  /**
  * Installs an extension that wavebox hosts
  * @param extensionId: the id of the extenion
  * @param downloadUrl: the url of the download
  * @return promise
  */
  downloadHostedExtension (extensionId, downloadUrl) {
    if (this.downloads.has(extensionId)) {
      return Promise.reject(new Error(`Extension with id "${extensionId}" is in download queue already`))
    }

    const installId = uuid.v4()
    this.downloads.set(extensionId, {
      installId: installId,
      extensionId: extensionId
    })

    const downloadPath = path.join(RuntimePaths.CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.zip`)
    const extractPath = path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId)
    return Promise.resolve()
      .then(() => this._downloadFile(downloadUrl, downloadPath))
      .then(() => fs.ensureDir(extractPath))
      .then(() => decompress(downloadPath, extractPath))
      .then(() => {
        try { fs.removeSync(downloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        return Promise.resolve(extensionId)
      })
      .catch((err) => {
        try { fs.removeSync(downloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        return Promise.reject(err)
      })
  }

  /**
  * Installs an extension from the cws
  * @param extensionId: the id of the extenion
  * @param cwsUrl: the cws url
  * @param cwsLock: the lock def for the cws entry
  * @param patchesUrl: the url of the patches download
  * @return promise
  */
  downloadCWSExtension (extensionId, cwsUrl, cwsLock, patchesUrl) {
    if (this.downloads.has(extensionId)) {
      return Promise.reject(new Error(`Extension with id "${extensionId}" is in download queue already`))
    }

    const installId = uuid.v4()
    this.downloads.set(extensionId, {
      installId: installId,
      extensionId: extensionId
    })

    const crxDownloadPath = path.join(RuntimePaths.CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.crx`)
    const patchesDownloadPath = path.join(RuntimePaths.CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.json`)
    const extractPath = path.join(RuntimePaths.CHROME_EXTENSION_INSTALL_PATH, extensionId)
    const patchDir = path.join(RuntimePaths.CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}`)
    const installLock = this._getCwsInstallLock(cwsLock)

    let manifest
    let extensionVersion

    return Promise.resolve()
      .then(() => { // Download CRX
        if (installLock) {
          return Promise.resolve()
            .then(() => this._downloadFile(installLock.download, crxDownloadPath))
            .then(() => fs.ensureDir(patchDir))
            .then(() => crxunzip(crxDownloadPath, patchDir))
        } else {
          return Promise.resolve()
            .then(() => {
              const purl = new URL(cwsUrl)
              purl.searchParams.set('prodversion', this.cwsProdVersion)
              return this._downloadFile(purl.toString(), crxDownloadPath)
            })
            .then(() => fs.ensureDir(patchDir))
            .then(() => crxunzip(crxDownloadPath, patchDir))
        }
      })
      .then(() => { // Load manifest
        return Promise.resolve()
          .then(() => fs.readJson(path.join(patchDir, 'manifest.json')))
          .then((data) => {
            manifest = data
            extensionVersion = CRExtensionVersionParser.valid(manifest.version)
            if (extensionVersion === null) {
              return Promise.reject(new Error(`Invalid version string "${manifest.version}"`))
            } else {
              return Promise.resolve()
            }
          })
      })
      .then(() => { // Download patches & apply
        return Promise.resolve()
          .then(() => {
            const purl = new URL(patchesUrl)
            purl.searchParams.set('prodversion', this.cwsProdVersion)
            purl.searchParams.set('extversion', extensionVersion)
            purl.searchParams.set('_', new Date().getTime())
            return this._downloadFile(purl.toString(), patchesDownloadPath)
          })
          .then(() => fs.readJson(patchesDownloadPath))
          .then((patches) => {
            if (patches.manifest) {
              Object.assign(manifest, patches.manifest)
            }
            return fs.writeJson(path.join(patchDir, 'manifest.json'), manifest)
          })
      })
      .then(() => { // Move into installed dir
        const lastRevision = CRExtensionFS.getLatestRevisionForVersion(extensionId, extensionVersion)
        const revision = lastRevision === undefined ? 0 : lastRevision + 1
        const versionDir = path.join(extractPath, `${extensionVersion}_${revision}`)
        const purgeVersions = installLock
          ? CRExtensionFS.listInstalledVersions(extensionId).map(({ versionString }) => versionString)
          : []

        return Promise.resolve()
          .then(() => fs.ensureDir(versionDir))
          .then(() => fs.move(patchDir, versionDir, { overwrite: true }))
          .then(() => {
            purgeVersions.forEach((versionStr) => {
              CRExtensionFS.setForPurge(extensionId, versionStr)
            })
            return Promise.resolve()
          })
      })
      // Finish & tidyup
      .then(() => {
        try { fs.removeSync(crxDownloadPath) } catch (ex) { }
        try { fs.removeSync(patchDir) } catch (ex) { }
        try { fs.removeSync(patchesDownloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        return Promise.resolve(extensionId)
      })
      .catch((err) => {
        try { fs.removeSync(crxDownloadPath) } catch (ex) { }
        try { fs.removeSync(patchDir) } catch (ex) { }
        try { fs.removeSync(patchesDownloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        return Promise.reject(err)
      })
  }

  /**
  * Installs an unpacked extension
  * @param inputDir: the path to the extension or manifest file
  * @return promise
  */
  downloadUnpackedExtension (inputDir) {
    const manifestPath = inputDir.endsWith('manifest.json')
      ? inputDir
      : path.join(inputDir, 'manifest.json')
    const extensionDir = path.dirname(manifestPath)

    const id = uuid.v4()
    let manifest
    let installPath
    return Promise.resolve()
      .then(() => fs.readJson(manifestPath))
      .then((m) => {
        manifest = m
        installPath = path.join(
          RuntimePaths.CHROME_EXTENSION_INSTALL_PATH,
          id,
          `${manifest.version}_0`
        )
        return fs.copy(extensionDir, installPath)
      })
      .then(() => {
        manifest.wavebox_extension_id = id
        return fs.writeJson(path.join(installPath, 'manifest.json'), manifest)
      })
      .then(() => {
        return id
      })
  }

  /* ****************************************************************************/
  // Updating
  /* ****************************************************************************/

  /**
  * Updates an extension from the CWS
  * @param extensions: the extensions to update
  * @return an array of extension ids that will update
  */
  updateCWSExtensions (extensions) {
    const updateIds = new Set()
    return Promise.resolve()
      // Check CWS
      .then(() => this._getUpdatableCWSExtensions(extensions))
      .then((cwsUpdateExtensions) => {
        cwsUpdateExtensions.forEach((ext) => {
          updateIds.add(ext.id)
        })
      })
      // Check WB
      .then(() => this._getUpdatableWaveboxManifests(extensions))
      .then((wbUpdateExtensions) => {
        wbUpdateExtensions.forEach((ext) => {
          updateIds.add(ext.id)
        })
      })
      // Cleanup checks
      .catch(() => Promise.resolve())

      // Build update list
      .then(() => {
        if (updateIds.size === 0) { return Promise.resolve([]) }
        const storeExtensionIndex = userStore.getState().extensionMap()
        const storeReferences = Array.from(updateIds)
          .map((id) => storeExtensionIndex.get(id))
          .filter((info) => !!info)
        return Promise.resolve(storeReferences)
      })
      // Download extensions
      .then((toDownload) => {
        return toDownload.reduce((acc, info) => {
          return acc
            .then(() => this.downloadCWSExtension(info.id, info.install.cwsUrl, info.install.cwsLock, info.install.waveboxUrl))
            .catch(() => Promise.resolve())
        }, Promise.resolve())
      })
      .then(() => {
        return Array.from(updateIds)
      })
  }

  /* ****************************************************************************/
  // Download utils
  /* ****************************************************************************/

  /**
  * Downloads a file
  * @param downloadUrl: the url of the download
  * @param destinationPath: the path to location to save the file
  * @return promise which contains the output path
  */
  _downloadFile (downloadUrl, destinationPath) {
    fs.ensureDirSync(path.dirname(destinationPath))
    return Promise.resolve()
      .then(() => fetch(downloadUrl, { useElectronNet: true }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(new Error(`Http Status not ok: ${res.httpStatus}`)))
      .then((res) => {
        return new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(destinationPath)
          res.body.pipe(stream)
            .on('error', (err) => {
              reject(err)
            })
            .on('finish', () => {
              resolve(destinationPath)
            })
        })
      })
  }

  /**
  * Gets a list of extensions that can be updates from the CWS
  * @param extensions: the list of extensions to check
  * @return promise which returns an array of extensions to be updated
  */
  _getUpdatableCWSExtensions (extensions) {
    const { cwsExtensions, lockedExtensions } = extensions.reduce((acc, extension) => {
      const cwsId = extension.manifest.wavebox.cwsId
      if (cwsId) {
        const installLock = this._getCwsInstallLock(extension.manifest.wavebox.cwsLock)
        if (installLock) {
          if (installLock.version !== extension.manifest.version) {
            acc.lockedExtensions.push(extension)
          }
        } else {
          acc.cwsExtensions.set(cwsId, extension)
        }
      }
      return acc
    }, {
      cwsExtensions: new Map(),
      lockedExtensions: []
    })

    const updateQS = Array.from(cwsExtensions.entries()).map(([cwsId, extension]) => {
      return querystring.stringify({
        id: cwsId,
        v: extension.manifest.version,
        installsource: 'ondemand',
        uc: ''
      })
    })
    const fullQS = querystring.stringify({
      response: 'updatecheck',
      prodversion: this.cwsProdVersion,
      x: updateQS
    })
    const reqURL = `https://clients2.google.com/service/update2/crx?${fullQS}`

    return Promise.resolve()
      .then(() => fetch(reqURL, { useElectronNet: true }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(new Error(`Http Status not ok: ${res.httpStatus}`)))
      .then((res) => res.text())
      .then((xmlString) => {
        return new Promise((resolve, reject) => {
          xml2js.parseString(xmlString, (err, xml) => {
            if (err) {
              reject(err)
            } else {
              const availableUpdates = xml.gupdate.app.reduce((acc, app) => {
                try {
                  const id = app.$.appid
                  const status = app.updatecheck[0].$.status
                  if (status !== 'noupdate') {
                    acc.add(id)
                  }
                } catch (ex) { /* no-op */ }
                return acc
              }, new Set())
              return resolve(availableUpdates)
            }
          })
        })
      })
      .then((cwsIds) => {
        return Array.from(cwsIds)
          .map((cwsId) => cwsExtensions.get(cwsId))
          .filter((ext) => !!ext)
          .concat(lockedExtensions)
      })
  }

  /**
  * Gets a list of extensions that have wavebox updates
  * @param extensions: the list of extensions to check
  * @return promise which returns an array of extensions to be updated
  */
  _getUpdatableWaveboxManifests (extensions) {
    const storeExtensionIndex = userStore.getState().extensionMap()
    return Promise.resolve()
      .then(() => {
        return extensions.filter((extension) => {
          const store = storeExtensionIndex.get(extension.id)
          if (!store) { return false }

          const storeVersion = store.version || '0.0.0'
          const extensionVersion = extension.manifest.wavebox.version || '0.0.0'

          try {
            return semver.gt(storeVersion, extensionVersion)
          } catch (ex) {
            return false
          }
        })
      })
  }

  /* ****************************************************************************/
  // Lock utils
  /* ****************************************************************************/

  /**
  * Gets the CWS install lock
  * @param cwsLock: the lock array
  * @return a matching lock or undefined
  */
  _getCwsInstallLock (cwsLock) {
    return !Array.isArray(cwsLock) ? undefined : cwsLock.find((lock) => {
      try {
        return semver.satisfies(pkg.version, lock.wavebox)
      } catch (ex) {
        return false
      }
    })
  }
}

export default CRExtensionDownloader
