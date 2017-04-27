import querystring from 'querystring'

class TrelloHTTP {
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
  * Syncs a profile for a mailbox
  * @param appKey: the app key to use
  * @param auth: the auth token to use
  * @return promise
  */
  static fetchAccountProfile (appKey, auth) {
    if (!auth || !appKey) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      key: appKey,
      token: auth,
      fields: 'username,avatarSource,avatarHash,email,fullName,initials'
    })
    return Promise.resolve()
      .then(() => window.fetch('https://api.trello.com/1/members/me?' + query))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Fetches the unread notifications for the authed account
  * @param appKey: the app key to use
  * @param auth: the auth token to use
  * @param promise
  */
  static fetchUnreadNotifications (appKey, auth) {
    if (!auth || !appKey) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      key: appKey,
      token: auth,
      read_filter: 'unread',
      limit: 1000
    })

    return Promise.resolve()
      .then(() => window.fetch('https://api.trello.com/1/members/me/notifications/?' + query))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }
}

export default TrelloHTTP
