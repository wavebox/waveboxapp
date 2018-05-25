import Bootstrap from 'R/Bootstrap'
import querystring from 'querystring'
import { WB_FETCH_SERVICE_TEXT } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import uuid from 'uuid'
import { google } from 'googleapis'
import axiosDefaults from 'axios/lib/defaults'
import axiosXHRAdaptor from 'axios/lib/adapters/xhr'

// Configure Google
google.options({
  adapter: axiosXHRAdaptor,
  transformRequest: (data, headers) => {
    delete headers['User-Agent']
    delete headers['Accept-Encoding']
    return axiosDefaults.transformRequest[0](data, headers)
  }
})

const gPlus = google.plus('v1')
const gmail = google.gmail('v1')
const OAuth2 = google.auth.OAuth2
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = Bootstrap.credentials

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

    return Promise.resolve()
      .then(() => gmail.users.watch({
        userId: 'me',
        resource: {
          topicName: 'projects/wavebox-158310/topics/gmail'
        },
        auth: auth
      }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
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

    return Promise.resolve()
      .then(() => gPlus.people.get({ userId: 'me', auth: auth }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
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

    return Promise.resolve()
      .then(() => gmail.users.getProfile({
        userId: 'me',
        auth: auth
      }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
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

    return Promise.resolve()
      .then(() => gmail.users.history.list({
        userId: 'me',
        startHistoryId: fromHistoryId,
        auth: auth
      }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
      })
  }

  /* **************************************************************************/
  // Gmail: Labels
  /* **************************************************************************/

  /**
  * Syncs the label for a mailbox. The label is a cheap call which can be used
  * to decide if the mailbox has changed
  * @param auth: the auth to access google with
  * @param labelId: the id of the label to sync
  * @return promise
  */
  static fetchGmailLabel (auth, labelId) {
    if (!auth) { return this._rejectWithNoAuth() }

    return Promise.resolve()
      .then(() => gmail.users.labels.get({
        userId: 'me',
        id: labelId,
        auth: auth
      }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
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

    return Promise.resolve()
      .then(() => gmail.users.threads.list({
        userId: 'me',
        labelIds: labelIds,
        q: query,
        maxResults: limit,
        auth: auth
      }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
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

    return Promise.resolve()
      .then(() => gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        auth: auth
      }))
      .then((res) => {
        if (res.status === 200) {
          return Promise.resolve(res.data)
        } else {
          return Promise.reject(new Error(`Invalid HTTP status code ${res.status}`))
        }
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

  /* **************************************************************************/
  // Gmail: Atom
  /* **************************************************************************/

  /**
  * Fetches and parses an atom feed
  * @param partitionId: the id of the partition to run with
  * @param url: the url to fetch
  * @return promise: with the parsed xml content
  */
  static fetchGmailAtomFeed (partitionId, url) {
    return new Promise((resolve, reject) => {
      const returnChannel = `${WB_FETCH_SERVICE_TEXT}:${uuid.v4()}`
      ipcRenderer.once(returnChannel, (evt, err, res) => {
        if (err) {
          reject(new Error(err.message || 'Unknown Error'))
        } else {
          const parser = new window.DOMParser()
          const xmlDoc = parser.parseFromString(res, 'text/xml')
          resolve(xmlDoc)
        }
      })
      ipcRenderer.send(WB_FETCH_SERVICE_TEXT, returnChannel, partitionId, url, {
        credentials: 'include'
      })
    })
  }

  /**
  * Fetches the unread count from the atom feed
  * @param partitionId: the id of the partition to run with
  * @param url: the url to fetch
  * @return promise: the unread count or rejection if parsing failed
  */
  static fetchGmailAtomUnreadCount (partitionId, url) {
    return Promise.resolve()
      .then(() => this.fetchGmailAtomFeed(partitionId, url))
      .then((res) => {
        const el = res.getElementsByTagName('fullcount')[0]
        if (!el) { return Promise.reject(new Error('<fullcount> element not found')) }

        const count = parseInt(el.textContent)
        if (isNaN(count)) { return Promise.reject(new Error('Count is not a valid number')) }

        return Promise.resolve(count)
      })
  }
}

export default GoogleHTTP
