import { ipcMain, shell } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import RuntimePaths from 'Runtime/RuntimePaths'
import { Certificate } from '@fidm/x509'
import { URL } from 'url'
import { WB_OPEN_CERTIFICATES_FOLDER } from 'shared/ipcEvents'

const LOAD_LOG_FILENAME = 'certificate.log'
const privCerts = Symbol('privCerts')

class CustomHTTPSCertificateManager {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privCerts] = undefined
    ipcMain.on(WB_OPEN_CERTIFICATES_FOLDER, this._handleOpenCertificatesFolder)
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads a parses the certificates in the cert dir
  * @return true if a load was done, false if already loaded
  */
  loadSync () {
    if (this.isLoaded) { return false }

    // Check the dir
    let certFilenames
    try {
      certFilenames = fs.readdirSync(RuntimePaths.CUSTOM_CERTIFICATE_PATH)
    } catch (ex) {
      this[privCerts] = new Map()
      return true
    }

    // Load the certificates
    const log = [`--- Load started at ${new Date().toString()} ---`]
    this[privCerts] = certFilenames
      .reduce((acc, filename) => {
        if (filename === LOAD_LOG_FILENAME) { return acc }
        try {
          const dataBinary = fs.readFileSync(path.join(RuntimePaths.CUSTOM_CERTIFICATE_PATH, filename))
          const dataString = dataBinary.toString().replace(/\n/g, '').replace(/\r/g, '').trim()
          const cert = Certificate.fromPEM(dataBinary)
          acc.set(dataString, cert)
          log.push(`Loaded "${filename}"`)
        } catch (ex) {
          log.push(`Failed to load "${filename}"`)
        }
        return acc
      }, new Map())

    // Write a load-log
    try {
      fs.writeFileSync(path.join(RuntimePaths.CUSTOM_CERTIFICATE_PATH, LOAD_LOG_FILENAME), log.join('\n'))
    } catch (ex) {
      /* no-op */
    }

    return true
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isLoaded () { return this[privCerts] !== undefined }

  /* ****************************************************************************/
  // Certificate Handlers
  /* ****************************************************************************/

  /**
  * Handles a certificate error by checking the custom certificates
  * @param wc: the webcontents with the error
  * @param url: the url we're trying to load
  * @param error: the error that triggered
  * @param certificate: the certificate that was presented
  * @return true to allow the certificate, false otherwise
  */
  handleCertificateError (wc, url, error, certificate) {
    try {
      this.loadSync()

      // Fetch cert
      const userCert = this[privCerts].get(certificate.data.replace(/\n/g, '').replace(/\r/g, '').trim())
      if (!userCert) { return false }

      // Date check
      const now = new Date()
      const validFrom = new Date(userCert.validFrom)
      const validTo = new Date(userCert.validTo)
      if (isNaN(validFrom) || isNaN(validTo)) { return false }
      if (now < validFrom || now > validTo) { return false }

      // Url check
      const targetUrl = new URL(url)
      const targetCN = targetUrl.hostname.split('.').reverse()
      const matchCN = userCert.subject.commonName.split('.').reverse()

      const mismatchIndex = targetCN.findIndex((sd, index) => {
        if (matchCN[index] === undefined) { return true }
        if (matchCN[index] === sd) { return false }
        if (matchCN[index] === '*') { return false }
        return true
      })
      if (mismatchIndex !== -1) { return false }

      return true
    } catch (ex) {
      console.error(`Failed to handle certificate error, disallowing by default`, ex)
      return false
    }
  }

  /* ****************************************************************************/
  // IPC Handlers
  /* ****************************************************************************/

  /**
  * Handles a request to open the certificates folder
  * @param evt: the event that fired
  */
  _handleOpenCertificatesFolder = (evt) => {
    fs.ensureDir(RuntimePaths.CUSTOM_CERTIFICATE_PATH).then(() => {
      shell.showItemInFolder(RuntimePaths.CUSTOM_CERTIFICATE_PATH)
    })
  }
}

export default new CustomHTTPSCertificateManager()
