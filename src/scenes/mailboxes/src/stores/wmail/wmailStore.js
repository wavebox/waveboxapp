import alt from '../alt'
import actions from './wmailActions'
import path from 'path'
import fs from 'fs'
import { settingsActions } from 'stores/settings'
import { mailboxActions } from 'stores/mailbox'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import GoogleMailbox from 'shared/Models/Accounts/Google/GoogleMailbox'
import CoreService from 'shared/Models/Accounts/CoreService'
const AppDirectory = window.appNodeModulesRequire('appdirectory')

const appDirectory = new AppDirectory('wmail')
const dbPaths = {
  mailboxes: path.join(appDirectory.userData(), 'mailboxes_db.json'),
  settings: path.join(appDirectory.userData(), 'settings_db.json')
}

class WmailStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    /**
    * @return true if we can import the wmail stores
    */
    this.canImport = () => {
      let mailboxes = true
      try {
        fs.accessSync(dbPaths.mailboxes, fs.constants.R_OK)
      } catch (ex) {
        mailboxes = false
      }

      let settings = true
      try {
        fs.accessSync(dbPaths.settings, fs.constants.R_OK)
      } catch (ex) {
        settings = false
      }
      return mailboxes || settings
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleImportWmailSettings: actions.importWmailSettings
    })
  }

  /* **************************************************************************/
  // Handlers: Import
  /* **************************************************************************/

  handleImportWmailSettings () {
    let mailboxes = {}
    try {
      mailboxes = JSON.parse(fs.readFileSync(dbPaths.mailboxes, 'utf8'))
    } catch (ex) { }
    mailboxes = Object.keys(mailboxes).reduce((acc, k) => {
      acc[k] = JSON.parse(mailboxes[k])
      return acc
    }, {})

    let settings = {}
    try {
      settings = JSON.parse(fs.readFileSync(dbPaths.settings, 'utf8'))
    } catch (ex) { }
    settings.app = settings.app ? JSON.parse(settings.app) : {}
    settings.language = settings.language ? JSON.parse(settings.language) : {}
    settings.os = settings.os ? JSON.parse(settings.os) : {}
    settings.tray = settings.tray ? JSON.parse(settings.tray) : {}
    settings.ui = settings.ui ? JSON.parse(settings.ui) : {}

    // Settings: App
    if (settings.app.ignoreGPUBlacklist !== undefined) {
      settingsActions.ignoreGPUBlacklist.defer(settings.app.ignoreGPUBlacklist)
    }
    if (settings.app.disableSmoothScrolling !== undefined) {
      settingsActions.disableSmoothScrolling.defer(settings.app.disableSmoothScrolling)
    }
    if (settings.app.enableUseZoomForDSF !== undefined) {
      settingsActions.enableUseZoomForDSF.defer(settings.app.enableUseZoomForDSF)
    }

    // Settings: Language
    if (settings.language.spellcheckerEnabled !== undefined) {
      settingsActions.setEnableSpellchecker.defer(settings.language.spellcheckerEnabled)
    }

    // Settings: OS
    if (settings.os.alwaysAskDownloadLocation !== undefined) {
      settingsActions.setAlwaysAskDownloadLocation.defer(settings.os.alwaysAskDownloadLocation)
    }
    if (settings.os.defaultDownloadLocation !== undefined) {
      settingsActions.setDefaultDownloadLocation.defer(settings.os.defaultDownloadLocation)
    }
    if (settings.os.notificationsEnabled !== undefined) {
      settingsActions.setNotificationsEnabled.defer(settings.os.notificationsEnabled)
    }
    if (settings.os.notificationsSilent !== undefined) {
      settingsActions.setNotificationsSilent.defer(settings.os.notificationsSilent)
    }
    if (settings.os.openLinksInBackground !== undefined) {
      settingsActions.setOpenLinksInBackground.defer(settings.os.openLinksInBackground)
    }

    // Settings: Tray
    if (settings.tray.show !== undefined) {
      settingsActions.setShowTrayIcon.defer(settings.tray.show)
    }
    if (settings.tray.showUnreadCount !== undefined) {
      settingsActions.setShowTrayUnreadCount.defer(settings.tray.showUnreadCount)
    }
    if (settings.tray.dpiMultiplier !== undefined) {
      settingsActions.setDpiMultiplier.defer(settings.tray.dpiMultiplier)
    }

    // Settings: UI
    if (settings.ui.showTitlebar !== undefined) {
      settingsActions.setShowTitlebar.defer(settings.ui.showTitlebar)
    }
    if (settings.ui.showAppBadge !== undefined) {
      settingsActions.setShowAppBadge.defer(settings.ui.showAppBadge)
    }
    if (settings.ui.showTitlebarCount !== undefined) {
      settingsActions.setShowTitlebarUnreadCount.defer(settings.ui.showTitlebarCount)
    }
    if (settings.ui.showAppMenu !== undefined) {
      settingsActions.setShowAppMenu.defer(settings.ui.showAppMenu)
    }
    if (settings.ui.sidebarEnabled !== undefined) {
      settingsActions.setEnableSidebar.defer(settings.ui.sidebarEnabled)
    }
    if (settings.ui.openHidden !== undefined) {
      settingsActions.setOpenHidden.defer(settings.ui.openHidden)
    }

    // Mailboxes
    ;(mailboxes.__index__ || []).forEach((mailboxId) => {
      const mailbox = mailboxes[mailboxId]
      if (!mailbox) { return }

      const accessMode = mailbox.type === 'gmail' ? GoogleDefaultService.ACCESS_MODES.GMAIL : GoogleDefaultService.ACCESS_MODES.GINBOX
      const importedMailbox = {
        id: mailboxId,
        type: GoogleMailbox.type,
        auth: { isInvalid: true },

        showUnreadBadge: mailbox.showUnreadBadge,
        unreadCountsTowardsAppUnread: mailbox.unreadCountsTowardsAppUnread,
        showNotifications: mailbox.showNotifications,
        artificiallyPersistCookies: mailbox.artificiallyPersistCookies,
        color: mailbox.color,
        email: mailbox.email,

        // Services
        services: [
          {
            type: GoogleDefaultService.type,
            accessMode: accessMode,
            unreadMode: ((mode) => {
              if (mode === 'inbox') {
                return GoogleDefaultService.UNREAD_MODES.INBOX_ALL
              } else if (mode === 'inbox_unread') {
                return GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD
              } else if (mode === 'primary_inbox_unread') {
                return GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL
              } else if (mode === 'inbox_unread_important') {
                return GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT
              } else if (mode === 'ginbox_default') {
                return GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED
              } else {
                if (accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
                  return GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD
                } else if (accessMode === GoogleDefaultService.ACCESS_MODES.GINBOX) {
                  return GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED
                }
              }
            })((mailbox.googleConf || {}).unreadMode),
            zoomFactor: mailbox.zoomFactor,
            customCSS: mailbox.customCSS,
            customJS: mailbox.customJS
          }
        ].concat((mailbox.services || ['calendar', 'storage', 'notes']).map((type) => {
          switch (type) {
            case 'storage': return { type: CoreService.SERVICE_TYPES.STORAGE }
            case 'contacts': return { type: CoreService.SERVICE_TYPES.CONTACTS }
            case 'notes': return { type: CoreService.SERVICE_TYPES.NOTES }
            case 'calendar': return { type: CoreService.SERVICE_TYPES.CALENDAR }
            case 'communication': return { type: CoreService.SERVICE_TYPES.COMMUNICATION }
            default: return undefined
          }
        })).filter((s) => !!s)
      }

      mailboxActions.create.defer(mailboxId, importedMailbox)
    })
    window.location.hash = '/wmailimport/complete'
  }
}

export default alt.createStore(WmailStore, 'WmailStore')
