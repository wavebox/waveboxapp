import pkg from 'package.json'
import querystring from 'querystring'

class WaveboxHTTP {
  /* **************************************************************************/
  // News
  /* **************************************************************************/

  /**
  * Fetches the news heading from the server
  * @return promise
  */
  static fetchLatestNewsHeading () {
    return Promise.resolve()
      .then(() => window.fetch(`https://waveboxio.com/news/feed/?channel=${pkg.releaseChannel}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /**
  * Fetches the extension info
  * @param clientId: the users client id
  * @return promise
  */
  static fetchExtensionInfo (clientId) {
    return Promise.resolve()
      .then(() => window.fetch(`https://waveboxio.com/client/${clientId}/extensions.json?version=${pkg.version}&channel=${pkg.releaseChannel}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /**
  * Fetches the latest wire config
  * @param clientId: the users client id
  * @return promise
  */
  static fetchWireConfig (clientId) {
    return Promise.resolve()
      .then(() => window.fetch(`https://waveboxio.com/client/${clientId}/wire.json?version=${pkg.version}&channel=${pkg.releaseChannel}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /**
  * Fetches the container updates
  * @param clientId: the users client id
  * @param containerInfo: a dictionary of { id: version }
  * @return promise
  */
  static fetchContainerUpdates (clientId, containerInfo) {
    return Promise.resolve()
      .then(() => {
        return window.fetch(`https://waveboxio.com/updates/container/${clientId}/update.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: pkg.version,
            channel: pkg.releaseChannel,
            containers: containerInfo
          })
        })
      })
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /* **************************************************************************/
  // Add
  /* **************************************************************************/

  /**
  * Generates the add mailbox url
  * @param clientId: the id of the user
  * @param clientToken: the users token
  * @param accountTypes: a list of allowed account types
  * @param reachedAccountLimit: true if the user has reached their account limit
  * @param accountLimit: the limit of accounts the user is allowed to add
  * @return an authetncated url
  */
  static addMailboxUrl (clientId, clientToken, accountTypes, reachedAccountLimit, accountLimit) {
    const qs = querystring.stringify({
      c: clientId,
      t: clientToken,
      account_types: accountTypes,
      reached_account_limit: reachedAccountLimit,
      account_limit: accountLimit,
      wavebox_version: pkg.version
    })

    return `https://waveboxio.com/desktop/appstore?${qs}`
  }

  /* **************************************************************************/
  // User
  /* **************************************************************************/

  /**
  * Indicates that the user has agreed to the privacy policy
  * @param clientId: the id of the client
  * @param clientToken: the client token
  * @param privacyId: the id of the privacy request
  * @return promise
  */
  static agreePrivacy (clientId, clientToken, privacyId) {
    return Promise.resolve()
      .then(() => {
        return window.fetch(`https://waveboxio.com/clientapi/${clientId}/agree_privacy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: pkg.version,
            channel: pkg.releaseChannel,
            client_id: clientId,
            t: clientToken,
            id: privacyId
          })
        })
      })
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }
}

export default WaveboxHTTP
