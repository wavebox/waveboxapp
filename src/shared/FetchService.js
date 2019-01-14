import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { WB_FETCH_SERVICE_TEXT } from './ipcEvents'

class FetchService {
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
