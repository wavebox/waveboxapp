const google = window.appNodeModulesRequire('googleapis')
const gPlus = google.plus('v1')
const gmail = google.gmail('v1')
const OAuth2 = google.auth.OAuth2
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('R/Bootstrap').credentials
const GoogleHTTPTransporter = require('./GoogleHTTPTransporter')
const querystring = require('querystring')

class GoogleHTTP {
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
  // Auth
  /* **************************************************************************/

  /**
  * Generates the auth token object to use with Google
  * @param accessToken: the access token from the mailbox
  * @param refreshToken: the refresh token from the mailbox
  * @param expiryTime: the expiry time from the mailbox
  * @return the google auth object
  */
  static generateAuth (accessToken, refreshToken, expiryTime) {
    const auth = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryTime
    })
    auth.transporter = new GoogleHTTPTransporter()
    return auth
  }

  /**
  * Upgrades the initial temporary access code to a permenant access code
  * @param authCode: the temporary auth code
  * @param codeRedirectUri: the redirectUri that was used in getting the current code
  * @return promise
  */
  static upgradeAuthCodeToPermenant (authCode, codeRedirectUri) {
    return Promise.resolve()
      .then(() => window.fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify({
          code: authCode,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: codeRedirectUri
        })
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => Object.assign({ date: new Date().getTime() }, res))
  }

  /* **************************************************************************/
  // Watch
  /* **************************************************************************/

  /**
  * Watches an account for changes
  * @param auth: the auth to access google with
  * @return promise
  */
  static watchAccount (auth) {
    if (!auth) { return this._rejectWithNoAuth() }
    return new Promise((resolve, reject) => {
      gmail.users.watch({
        userId: 'me',
        topicName: 'projects/wavebox-158310/topics/gmail',
        auth: auth
      }, (err, response) => {
        err ? reject(err) : resolve(response)
      })
    })
  }

  /* **************************************************************************/
  // Profile
  /* **************************************************************************/

  /**
  * Syncs a profile for a mailbox
  * @param auth: the auth to access google with
  * @return promise
  */
  static fetchAccountProfile (auth) {
    if (!auth) { return this._rejectWithNoAuth() }
    return new Promise((resolve, reject) => {
      gPlus.people.get({
        userId: 'me',
        auth: auth
      }, (err, response) => {
        err ? reject(err) : resolve(response)
      })
    })
  }

  /**
  * Fetches a profile for a mailbox but with the raw auth details from google
  * @param rawAuth: the raw auth credentials from google
  * @return promise
  */
  static fetchAccountProfileWithRawAuth (rawAuth) {
    const expiry = new Date().getTime() + rawAuth.expires_in
    const auth = GoogleHTTP.generateAuth(rawAuth.access_token, rawAuth.refresh_token, expiry)
    return GoogleHTTP.fetchAccountProfile(auth)
  }

  /* **************************************************************************/
  // Gmail
  /* **************************************************************************/

  /**
  * Gets the users profile
  * @param auth: the auth object to access API
  * @return promise
  */
  static fetchGmailProfile (auth) {
    if (!auth) { return this._rejectWithNoAuth() }
    return new Promise((resolve, reject) => {
      gmail.users.getProfile({
        userId: 'me',
        auth: auth
      }, (err, response) => {
        err ? reject(err) : resolve(response)
      })
    })
  }

  /**
  * Fetches the history list of changes
  * @param auth: the auth objecto to access API
  * @param fromHistoryId: the start history id to get changes from
  * @return promise
  */
  static fetchGmailHistoryList (auth, fromHistoryId) {
    if (!auth) { return this._rejectWithNoAuth() }
    return new Promise((resolve, reject) => {
      gmail.users.history.list({
        userId: 'me',
        startHistoryId: fromHistoryId,
        auth: auth
      }, (err, response) => {
        err ? reject(err) : resolve(response)
      })
    })
  }

  /* **************************************************************************/
  // Gmail: Threads
  /* **************************************************************************/

  /**
  * Fetches the unread summaries for a mailbox
  * @param auth: the auth to access google with
  * @param query = undefined: the query to ask the server for
  * @param labelIds = []: a list of label ids to match on
  * @param limit=10: the limit on results to fetch
  * @return promise
  */
  static fetchGmailThreadHeadersList (auth, query = undefined, labelIds = [], limit = 25) {
    if (!auth) { return this._rejectWithNoAuth() }
    return new Promise((resolve, reject) => {
      gmail.users.threads.list({
        userId: 'me',
        labelIds: labelIds,
        q: query,
        maxResults: limit,
        auth: auth
      }, (err, response) => {
        err ? reject(err) : resolve(response)
      })
    })
  }

  /**
  * Fetches an email from a given id
  * @param auth: the auth to access google with
  * @param threadId: the id of the thread
  * @return promise
  */
  static fetchGmailThread (auth, threadId) {
    if (!auth) { return this._rejectWithNoAuth() }
    return new Promise((resolve, reject) => {
      gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        auth: auth
      }, (err, response) => {
        err ? reject(err) : resolve(response)
      })
    })
  }

  /**
  * Fetches multiple emails email from a set of thread ids
  * @param auth: the auth to access google with
  * @param threadIds: the array of thread ids to fetch
  * @return promise
  */
  static fetchMultipleGmailThreads (auth, threadIds) {
    return Promise.all(threadIds.map((threadId) => {
      return this.fetchGmailThread(auth, threadId)
    }))
  }

  /**
  * Fetches the changed threads from the gmail server
  * @param auth: the auth to use with google
  * @param knownThreads: any currently known threads that don't need to be fetched in an object keyed by id
  * @param threadHeaders: the latest thread headers which will be used to fetch the full heads if required
  * @param postProcessThread=undefined: a function to post process a thread before returning it. This must leave historyId and id intact
  * @return promise: with the threads ordered by threadHeaders all full resolved
  */
  static fullyResolveGmailThreadHeaders (auth, knownThreads, threadHeaders, postProcessThread = undefined) {
    const changedThreadIds = threadHeaders
      .filter((threadHeader) => {
        const known = knownThreads[threadHeader.id]
        return !known || known.historyId !== threadHeader.historyId
      })
      .map((threadHeader) => threadHeader.id)

    return Promise.resolve()
      .then(() => GoogleHTTP.fetchMultipleGmailThreads(auth, changedThreadIds))
      .then((threads) => {
        return threads.reduce((acc, thread) => {
          acc[thread.id] = postProcessThread ? postProcessThread(thread) : thread
          return acc
        }, {})
      })
      .then((updatedThreads) => {
        return threadHeaders.map((threadHeader) => {
          return updatedThreads[threadHeader.id] || knownThreads[threadHeader.id]
        })
      })
  }
}

module.exports = GoogleHTTP
