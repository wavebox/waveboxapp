import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WB_FETCH_SERVICE_TEXT } from './ipcEvents'

class FetchService {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  static get DEFAULT_ACCEPT_HEADER () { return 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' }
  static get DEFAULT_ACCEPT_IMAGE_HEADER () { return 'image/webp,image/apng,image/*,*/*;q=0.8' }
  static get DEFAULT_ACCEPT_VIDEO_HEADER () { return '*/*' }
  static get DEFAULT_ACCEPT_AUDIO_HEADER () { return '*/*' }
  static get DEFAULT_ACCEPT_SCRIPT_HEADER () { return '*/*' }
  static get DEFAULT_ACCEPT_CSS_HEADER () { return 'text/css,*/*;q=0.1' }
  static get DEFAULT_ACCEPT_ENCODING_HEADER () { return 'gzip, deflate, br' }
  static get DEFAULT_ACCEPT_LANGUAGE_HEADER () {
    if (window.navigator.languages.length > 1) {
      return window.navigator.languages.map((lang, index) => {
        return index === 0
          ? lang
          : `${lang};q=${1.0 - (index * 0.1)}`
      }).join(',')
    } else {
      return window.navigator.language
    }
  }
  static get DEFAULT_USER_AGENT_HEADER () { return window.navigator.userAgent }

  static get DEFAULT_HEADERS () {
    return {
      'accept': this.DEFAULT_ACCEPT_HEADER,
      'accept-encoding': this.DEFAULT_ACCEPT_ENCODING_HEADER,
      'accept-language': this.DEFAULT_ACCEPT_LANGUAGE_HEADER,
      'upgrade-insecure-requests': '1',
      'user-agent': this.DEFAULT_USER_AGENT_HEADER
    }
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Performs a request
  * @param url: the url to fetch
  * @param partitionId: the id of the partition or undefined
  * @param options={}: the request options
  * @return promise
  */
  static request (url, partitionId, options = {}) {
    return new Promise((resolve, reject) => {
      const returnChannel = `${WB_FETCH_SERVICE_TEXT}:${uuid.v4()}`
      ipcRenderer.once(returnChannel, (evt, err, res, body) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            status: res.status,
            ok: res.ok,
            text: () => Promise.resolve(body),
            json: () => Promise.resolve(JSON.parse(body))
          })
        }
      })
      ipcRenderer.send(WB_FETCH_SERVICE_TEXT, returnChannel, partitionId, url, options)
    })
  }
}

export default FetchService
