import Boostrap from 'R/Bootstrap'
import querystring from 'querystring'

const {
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID_V2
} = Boostrap.credentials

class MicrosoftHTTP {
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
  * Upgrades the initial temporary access code to a permenant access code
  * @param authCode: the temporary auth code
  * @param codeRedirectUri: the redirectUri that was used in getting the current code
  * @param protocolVersion=2: the protocol version to use
  * @return promise
  */
  static upgradeAuthCodeToPermenant (authCode, codeRedirectUri) {
    return Promise.resolve()
      .then(() => window.fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify({
          code: authCode,
          client_id: MICROSOFT_CLIENT_ID_V2,
          redirect_uri: codeRedirectUri,
          grant_type: 'authorization_code'
        })
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        return {
          date: new Date().getTime(),
          protocolVersion: 2,
          ...res
        }
      })
      .then((auth) => {
        // Find out which type of account this is
        return Promise.resolve()
          .then(() => window.fetch('https://graph.microsoft.com/v1.0/organization', {
            method: 'get',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'wavebox',
              'Authorization': `Bearer ${auth.access_token}`
            }
          }))
          .then((res) => {
            if (res.ok) {
              return res.json().then((data) => {
                if (data.value && data.value.length) {
                  return Promise.resolve({ ...auth, isPersonalAccount: false })
                } else {
                  return Promise.resolve({ ...auth, isPersonalAccount: true })
                }
              })
            } else {
              return Promise.resolve({ ...auth, isPersonalAccount: true })
            }
          })
      })
      .then((auth) => {
        // Get some identification info about the account
        return Promise.resolve()
          .then(() => this.fetchAccountProfile(auth.access_token))
          .then((res) => {
            return Promise.resolve({ ...auth, userPrincipalName: res.userPrincipalName })
          })
          .catch(() => {
            return Promise.resolve(auth)
          })
      })
  }

  /**
  * Grabs a new auth token
  * @param refreshToken: the refresh token
  * @param protocolVersion=2: the protocol version to use
  * @return promise
  */
  static refreshAuthToken (refreshToken, protocolVersion = 2) {
    let body
    switch (protocolVersion) {
      case 1:
        body = {
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }
        break
      case 2:
        body = {
          client_id: MICROSOFT_CLIENT_ID_V2,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }
        break
    }

    return Promise.resolve()
      .then(() => window.fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify(body)
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => Object.assign({ date: new Date().getTime() }, res))
  }

  /* **************************************************************************/
  // Profile
  /* **************************************************************************/

  /**
  * Syncs a profile for a mailbox
  * @param auth: the auth to access microsoft
  * @return promise
  */
  static fetchAccountProfile (auth) {
    if (!auth) { return this._rejectWithNoAuth() }

    return Promise.resolve()
      .then(() => window.fetch('https://graph.microsoft.com/v1.0/me', {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /**
  * Fetches the live profile image for a user
  * @param auth: the auth to access microsoft
  * @param userId: the id of the user
  * @return promise
  */
  static fetchLiveProfileImage (auth, userId) {
    if (!auth) { return this._rejectWithNoAuth() }

    return Promise.resolve()
      .then(() => window.fetch(`https://apis.live.net/v5.0/${userId}/picture`, {
        method: 'get',
        headers: {
          'Accept': 'image'
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.text())
  }

  /* **************************************************************************/
  // Mail
  /* **************************************************************************/

  /**
  * Fetches the inbox folder unread count and messages from the server
  * @param auth: the auth to access microsoft
  * @param limit = 1000: the maximum amount of messages to fetch
  * @return promise with { unreadCount, messages }
  */
  static fetchInboxUnreadCountAndUnreadMessages (auth, limit = 1000) {
    return Promise.resolve()
      .then(() => this.fetchMailfolderAndUnreadMessages(auth, 'inbox', limit))
      .then(({ mailfolder, messages }) => {
        return Promise.resolve({ unreadCount: mailfolder.unreadItemCount, messages: messages })
      })
  }

  /**
  * Fetches the mail folder and messages from the server
  * @param auth: the auth to access microsoft
  * @param folder = 'inbox': the folder to fetch
  * @param limit = 1000: the maximum amount of messages to fetch
  * @return promise with { mailfolder, messages }
  */
  static fetchMailfolderAndUnreadMessages (auth, folder = 'inbox', limit = 1000) {
    let mailfolder
    let messages
    return Promise.resolve()
      .then(() => this.fetchMailfolder(auth, folder))
      .then((res) => { mailfolder = res; return Promise.resolve() })
      .then(() => this.fetchUnreadMessages(auth, folder, limit))
      .then((res) => { messages = res; return Promise.resolve() })
      .then(() => {
        return Promise.resolve({ mailfolder: mailfolder, messages: messages })
      })
  }

  /**
  * Fetches the mail folder from the server
  * @param auth: the auth to access microsoft
  * @param folder = 'inbox': the folder to fetch
  * @return promise
  */
  static fetchMailfolder (auth, folder = 'inbox') {
    if (!auth) { return this._rejectWithNoAuth() }

    return Promise.resolve()
      .then(() => window.fetch(`https://graph.microsoft.com/beta/me/mailFolders/${folder}`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /**
  * Fetches the unread messages from the server
  * @param auth: the auth to access microsoft
  * @param folder = 'inbox': the folder to get messages from
  * @param limit = 1000: the limit of messages to fetch
  * @return promise
  */
  static fetchUnreadMessages (auth, folder = 'inbox', limit = 1000) {
    if (!auth) { return this._rejectWithNoAuth() }

    const query = querystring.stringify({
      '$select': 'Id,Subject,BodyPreview,ReceivedDateTime,from,webLink',
      '$filter': 'IsRead eq false',
      '$orderby': 'ReceivedDateTime DESC',
      '$top': limit
    })

    return Promise.resolve()
      .then(() => window.fetch(`https://graph.microsoft.com/beta/me/mailFolders/${folder}/messages?${query}`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.value)
  }

  /**
  * Fetches the focused mail folder unread count and messages from the server
  * @param auth: the auth to access microsoft
  * @param limit = 1000: the maximum amount of messages to fetch
  * @return promise with { unreadCount, messages }
  */
  static fetchFocusedUnreadCountAndUnreadMessages (auth, limit = 1000) {
    let unreadCount
    let messages
    return Promise.resolve()
      .then(() => this.fetchFocusedUnreadCount(auth))
      .then((res) => { unreadCount = res.count; return Promise.resolve() })
      .then(() => this.fetchFocusedUnreadMessages(auth, limit))
      .then((res) => { messages = res; return Promise.resolve() })
      .then(() => {
        return Promise.resolve({ unreadCount: unreadCount, messages: messages })
      })
  }

  /**
  * Fetches focused unread count in a round-about way
  * @param auth: the auth to access microsoft
  * @param limit = 1000: the limit of messages to fetch
  * @return promise
  */
  static fetchFocusedUnreadCount (auth, limit = 1000) {
    const query = querystring.stringify({
      '$select': 'Id',
      '$filter': `IsRead eq false and InferenceClassification eq 'focused'`,
      '$top': limit
    })

    return Promise.resolve()
      .then(() => window.fetch(`https://graph.microsoft.com/beta/me/mailFolders/inbox/messages?${query}`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => { return { count: res.value.length } })
  }

  /**
  * Fetches the focused unread messages in a round-about way
  * @param auth: the auth to access microsoft
  * @param limit = 10: the limit of messages to fetch
  * @return promise
  */
  static fetchFocusedUnreadMessages (auth, limit = 10) {
    const query = querystring.stringify({
      '$select': 'Id,Subject,BodyPreview,ReceivedDateTime,from,webLink,InferenceClassification',
      '$filter': 'IsRead eq false',
      '$orderby': 'ReceivedDateTime DESC',
      '$top': limit
    })

    return Promise.resolve()
      .then(() => window.fetch(`https://graph.microsoft.com/beta/me/mailFolders/inbox/messages?${query}`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        return res.value
          .filter((m) => m.inferenceClassification === 'focused')
          .slice(0, limit)
      })
  }

  /**
  * Marks a message as being read
  * @param auth: the auth to access microsoft
  * @param messageId: the id of the message to mark
  * @return promise
  */
  static markMessageRead (auth, messageId) {
    return Promise.resolve()
      .then(() => window.fetch(`https://graph.microsoft.com/beta/me/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isRead: true
        })
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /* **************************************************************************/
  // Office 365
  /* **************************************************************************/

  /**
  * Fetches the office 365 drive url
  * @param auth: the auth to access microsoft
  * @return promise
  */
  static fetchOffice365DriveUrl (auth) {
    if (!auth) { return this._rejectWithNoAuth() }

    return Promise.resolve()
      .then(() => window.fetch('https://graph.microsoft.com/v1.0/me/drive', {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => window.fetch(`https://graph.microsoft.com/v1.0/drives/${res.id}/root`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => res.webUrl)
  }

  /**
  * Fetches the office 365 avatar
  * @param auth: the auth to access microsoft
  * @return promise
  */
  static fetchOffice365Avatar (auth) {
    if (!auth) { return this._rejectWithNoAuth() }

    return Promise.resolve()
      .then(() => window.fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        method: 'get',
        headers: {
          'User-Agent': 'wavebox',
          'Authorization': `Bearer ${auth}`
        }
      }))
      .then((res) => {
        if (res.ok) {
          return Promise.resolve()
            .then(() => res.blob())
            .then((blob) => {
              return new Promise((resolve, reject) => {
                const objectURL = window.URL.createObjectURL(blob)
                const loader = new window.Image()
                loader.onload = () => {
                  const draw = document.createElement('canvas')
                  draw.width = loader.width
                  draw.height = loader.height
                  draw.getContext('2d').drawImage(loader, 0, 0, loader.width, loader.height)
                  const dataURL = draw.toDataURL()
                  window.URL.revokeObjectURL(objectURL)
                  resolve(dataURL)
                }
                loader.onerror = (err) => {
                  window.URL.revokeObjectURL(objectURL)
                  reject(err)
                }
                loader.src = objectURL
              })
            })
        } else if (res.status === 404) {
          return Promise.resolve(undefined)
        } else {
          return Promise.reject(res)
        }
      })
  }
}

export default MicrosoftHTTP
