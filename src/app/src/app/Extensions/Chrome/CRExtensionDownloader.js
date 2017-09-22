const { webContents } = require('electron')
const fs = require('fs-extra')
const decompress = require('decompress')
const crxunzip = require('unzip-crx')
const path = require('path')
const uuid = require('uuid')
const semver = require('semver')
const appendQS = require('append-query')
const {
  CR_EXTENSION_DOWNLOAD_PARTITION_PREFIX
} = require('../../../shared/extensionApis')
const {
  CHROME_EXTENSION_DOWNLOAD_PATH,
  CHROME_EXTENSION_INSTALL_PATH
} = require('../../MProcManagers/PathManager')

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
    const downloader = webContents.create({
      partition: `${CR_EXTENSION_DOWNLOAD_PARTITION_PREFIX}${installId}`,
      isBackgroundPage: true,
      commandLineSwitches: '--background-page'
    })
    this.downloads.set(extensionId, {
      webContents: downloader,
      installId: installId,
      extensionId: extensionId
    })

    const downloadPath = path.join(CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.zip`)
    const extractPath = path.join(CHROME_EXTENSION_INSTALL_PATH, extensionId)
    return Promise.resolve()
      .then(() => this._downloadFile(downloader, downloadUrl, downloadPath))
      .then(() => fs.ensureDir(extractPath))
      .then(() => decompress(downloadPath, extractPath))
      .then(() => {
        try { fs.removeSync(downloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        downloader.destroy()
        return Promise.resolve(extensionId)
      })
      .catch((err) => {
        try { fs.removeSync(downloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        downloader.destroy()
        return Promise.reject(err)
      })
  }

  /**
  * Installs an extension from the cws
  * @param extensionId: the id of the extenion
  * @param patchesUrl: the url of the patches download
  * @return promise
  */
  downloadCWSExtension (extensionId, cwsUrl, patchesUrl) {
    if (this.downloads.has(extensionId)) {
      return Promise.reject(new Error(`Extension with id "${extensionId}" is in download queue already`))
    }

    const installId = uuid.v4()
    const prodVersion = process.versions.chrome.split('.').slice(0, 2).join('.')

    const downloader = webContents.create({
      partition: `${CR_EXTENSION_DOWNLOAD_PARTITION_PREFIX}${installId}`,
      isBackgroundPage: true,
      commandLineSwitches: '--background-page'
    })
    this.downloads.set(extensionId, {
      webContents: downloader,
      installId: installId,
      extensionId: extensionId
    })

    const crxDownloadPath = path.join(CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.crx`)
    const patchesDownloadPath = path.join(CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}.json`)
    const extractPath = path.join(CHROME_EXTENSION_INSTALL_PATH, extensionId)
    const patchDir = path.join(CHROME_EXTENSION_DOWNLOAD_PATH, `${installId}`)

    let manifest
    let extensionVersion

    return Promise.resolve()
      .then(() => { // Download CRX
        return Promise.resolve()
          .then(() => this._downloadFile(downloader, appendQS(cwsUrl, { prodversion: prodVersion }), crxDownloadPath))
          .then(() => fs.ensureDir(patchDir))
          .then(() => crxunzip(crxDownloadPath, patchDir))
      })
      .then(() => { // Load manifest
        return Promise.resolve()
          .then(() => fs.readJson(path.join(patchDir, 'manifest.json')))
          .then((data) => {
            manifest = data
            extensionVersion = semver.valid(manifest.version)
            if (extensionVersion === null) {
              return Promise.reject(new Error(`Invalid version string "${manifest.version}"`))
            } else {
              return Promise.resolve()
            }
          })
      })
      .then(() => { // Download patches & apply
        return Promise.resolve()
          .then(() => this._downloadFile(downloader, appendQS(patchesUrl, { prodversion: prodVersion, extversion: extensionVersion }), patchesDownloadPath))
          .then(() => fs.readJson(patchesDownloadPath))
          .then((patches) => {
            if (patches.manifest) {
              Object.assign(manifest, patches.manifest)
            }
            return fs.writeJson(path.join(patchDir, 'manifest.json'), manifest)
          })
      })
      .then(() => { // Move into installed dir
        const versionDir = path.join(extractPath, `${extensionVersion}_0`)
        return Promise.resolve()
          .then(() => fs.ensureDir(versionDir))
          .then(() => fs.move(patchDir, versionDir, { overwrite: true }))
      })
      // Finish & tidyup
      .then(() => {
        try { fs.removeSync(crxDownloadPath) } catch (ex) { }
        try { fs.removeSync(patchDir) } catch (ex) { }
        try { fs.removeSync(patchesDownloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        downloader.destroy()
        return Promise.resolve(extensionId)
      })
      .catch((err) => {
        try { fs.removeSync(crxDownloadPath) } catch (ex) { }
        try { fs.removeSync(patchDir) } catch (ex) { }
        try { fs.removeSync(patchesDownloadPath) } catch (ex) { }
        this.downloads.delete(extensionId)
        downloader.destroy()
        return Promise.reject(err)
      })
  }

  /* ****************************************************************************/
  // Download utils
  /* ****************************************************************************/

  /**
  * Downloads a file
  * @param downloader: the downloader instance
  * @param downloadUrl: the url of the download
  * @param destinationPath: the path to location to save the file
  * @return promise which contains the output path
  */
  _downloadFile (downloader, downloadUrl, destinationPath) {
    return new Promise((resolve, reject) => {
      let downloadHandler
      downloadHandler = (evt, item, webContents) => {
        fs.ensureDirSync(path.dirname(destinationPath))
        item.setSavePath(destinationPath)

        item.on('done', (e, state) => {
          downloader.session.removeListener('will-download', downloadHandler)

          if (state === 'completed') {
            resolve(destinationPath)
          } else {
            reject(new Error('Download failed'))
          }
        })
      }

      downloader.session.on('will-download', downloadHandler)
      downloader.downloadURL(downloadUrl)
    })
  }
}

module.exports = CRExtensionDownloader
