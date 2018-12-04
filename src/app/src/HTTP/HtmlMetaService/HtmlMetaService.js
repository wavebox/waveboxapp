import fetch from 'electron-fetch'
import { session } from 'electron'
import unfluff from 'unfluff'
import htmlMetadata from 'html-metadata'
import HtmlMetaResult from './HtmlMetaResult'

class HtmlMetaService {
  /* ****************************************************************************/
  // Fetching
  /* ****************************************************************************/

  /**
  * Fetches metadata about a url
  * @param url: the url to fetch
  * @return promise
  */
  fetchMeta (url) {
    const res = new HtmlMetaResult(url)

    return Promise.resolve()
      .then(() => fetch(url, {
        useElectronNet: true,
        session: session.fromPartition('temp')
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(new Error(`HTTP status not ok: ${res.httpStatus}`)))
      .then((res) => res.text())
      .then((html) => {
        if (res.hasMissing) {
          try {
            const meta = unfluff(html)
            res.title = meta.title
            res.favicon = meta.favicon
            return html
          } catch (ex) {
            return html
          }
        } else {
          return html
        }
      })
      .then((html) => {
        if (res.hasMissing) {
          return Promise.resolve()
            .then(() => htmlMetadata.loadFromString(html))
            .then((meta) => {
              if (meta.general) {
                res.title = meta.general.title
                if (meta.general.icons && meta.general.icons[0]) {
                  res.favicon = meta.general.icons[0].href
                }
              }
              return html
            })
            .catch((ex) => {
              return Promise.resolve(html)
            })
        } else {
          return html
        }
      })
      .then((html) => {
        return res.toJS
      })
  }
}

export default new HtmlMetaService()
