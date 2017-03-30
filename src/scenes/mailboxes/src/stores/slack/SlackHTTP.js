const querystring = require('querystring')
const SlackRTM = require('./SlackRTM')

class SlackHTTP {
  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Rejects a call because the mailbox has no authentication info
  * @param info: any information we have
  * @return promise - rejected
  */
  static _rejectWithNoAuth (info) {
    return Promise.reject(new Error('Mailbox missing authentication information'))
  }

  /* **************************************************************************/
  // Profile
  /* **************************************************************************/

  /**
  * Tests the auth
  * @param auth: the auth token
  * @return promise
  */
  static testAuth (auth) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      token: auth
    })
    return Promise.resolve()
      .then(() => window.fetch('https://slack.com/api/auth.test?' + query))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
  }

  /* **************************************************************************/
  // RTM Start
  /* **************************************************************************/

  /**
  * Starts the RTM sync service
  * @param auth: the auth token
  * @return promise
  */
  static startRTM (auth) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      token: auth
    })
    return Promise.resolve()
      .then(() => window.fetch('https://slack.com/api/rtm.start?' + query))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => {
        return { response: res, rtm: new SlackRTM(res.url) }
      })
  }

  /* **************************************************************************/
  // Unread
  /* **************************************************************************/

  /**
  * Gets the unread info from the server
  * @param auth: the auth token
  */
  static fetchUnreadInfo (auth) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      token: auth
    })
    return Promise.resolve()
      .then(() => window.fetch('https://slack.com/api/users.counts?' + query))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
  }
}

module.exports = SlackHTTP
