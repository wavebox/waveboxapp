import { ipcMain } from 'electron'
import { WB_AUTH_SLACK, WB_AUTH_SLACK_COMPLETE, WB_AUTH_SLACK_ERROR } from 'shared/ipcEvents'
import { URL } from 'url'
import AuthWindow from 'Windows/AuthWindow'
import Resolver from 'Runtime/Resolver'
import { SessionManager } from 'SessionManager'
import { userStore } from 'stores/user'

class AuthSlack {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.signinFallbackTO = null
    ipcMain.on(WB_AUTH_SLACK, (evt, body) => {
      this.handleAuthSlack(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Tries to scrape the authentication info from the webcontents
  * @return promise, rejected if could not be found
  */
  _scrapeAuthenticationInfo (webContents) {
    if (!webContents || webContents.isDestroyed()) {
      return Promise.reject(new Error('Webcontents no longer active'))
    }
    return new Promise((resolve, reject) => {
      const js = `(function () {
        if (window.TS && window.TS.boot_data && window.TS.boot_data.api_token) {
          return { token: window.TS.boot_data.api_token }
        } else if (window.slackDebug) {
          if (window.slackDebug.activeTeam && window.slackDebug.activeTeam.redux) {
            const state = window.slackDebug.activeTeam.redux.getState()
            if (state && state.bootData && state.bootData.api_token) {
              return { token: state.bootData.api_token }
            }
          } else {
            return { retry: true }
          }
        }
        return {}
      })()`
      webContents.executeJavaScript(js, (res) => {
        if (res) {
          if (res.token) {
            return resolve({ token: res.token })
          } else if (res.retry) {
            setTimeout(() => {
              this._scrapeAuthenticationInfo(webContents).then(resolve, reject)
            }, 500)
            return
          }
        }

        reject(new Error('Not found'))
      })
    })
  }

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param partitionId: the id of the partition
  * @return promise
  */
  promptUserToGetAuthorizationCode (partitionId) {
    clearTimeout(this.signinFallbackTO)
    return new Promise((resolve, reject) => {
      const waveboxOauthWin = new AuthWindow()
      waveboxOauthWin.create('https://slack.com/signin', {
        useContentSize: true,
        center: true,
        show: true,
        resizable: false,
        standardWindow: true,
        autoHideMenuBar: true,
        title: 'Slack',
        height: 750,
        width: 830, // fixes some styling issues with the slack toolbar
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          nativeWindowOpen: true,
          sharedSiteInstances: true,
          partition: partitionId,
          preload: Resolver.guestPreload(),
          preloadCrx: Resolver.crExtensionApi()
        }
      })
      const oauthWin = waveboxOauthWin.window
      const emitter = SessionManager.webRequestEmitterFromPartitionId(partitionId)
      let userClose = true

      // Handle navigate
      // User gives permission for wavebox - fetch token and app key and finish
      const handleBeforeRequest = (details, responder) => {
        if (details.webContentsId === oauthWin.webContents.id && details.resourceType === 'mainFrame') {
          const purl = new URL(details.url)
          if (purl.host === 'slack.com' && purl.pathname.indexOf('/checkcookie') === 0 && purl.searchParams.get('redir')) {
            oauthWin.hide()
            if (userStore.getState().wceSlackSigninFallback()) {
              clearTimeout(this.signinFallbackTO)
              this.signinFallbackTO = setTimeout(() => {
                oauthWin.show()
              }, 5000)
            }
          }
        }
        responder({})
      }
      emitter.beforeRequest.onBlocking(undefined, handleBeforeRequest)

      // Capture auth info
      oauthWin.webContents.on('dom-ready', (evt) => {
        this._scrapeAuthenticationInfo(oauthWin.webContents)
          .then((data) => {
            userClose = false
            oauthWin.close()
            clearTimeout(this.signinFallbackTO)
            resolve(data)
          })
          .catch(() => { /* no-op */ })
      })

      // Handle close
      oauthWin.on('closed', () => {
        emitter.beforeRequest.removeListener(handleBeforeRequest)
        if (userClose) {
          clearTimeout(this.signinFallbackTO)
          reject(new Error('User closed the window'))
        }
      })
    })
  }

  /* ****************************************************************************/
  // Request Handlers
  /* ****************************************************************************/

  /**
  * Handles the oauth request
  * @param evt: the incoming event
  * @param body: the body sent to us
  */
  handleAuthSlack (evt, body) {
    Promise.resolve()
      .then(() => this.promptUserToGetAuthorizationCode(body.partitionId))
      .then(({ token }) => {
        evt.sender.send(WB_AUTH_SLACK_COMPLETE, {
          mode: body.mode,
          context: body.context,
          auth: {
            provisional: body.provisional,
            token: token,
            partitionId: body.partitionId
          }
        })
      }, (err) => {
        evt.sender.send(WB_AUTH_SLACK_ERROR, {
          mode: body.mode,
          context: body.context,
          error: err,
          errorString: (err || {}).toString ? (err || {}).toString() : undefined,
          errorMessage: (err || {}).message ? (err || {}).message : undefined,
          errorStack: (err || {}).stack ? (err || {}).stack : undefined
        })
      })
  }
}

export default AuthSlack
