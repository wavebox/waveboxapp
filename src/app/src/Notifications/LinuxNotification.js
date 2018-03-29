import { BrowserWindow, screen, ipcMain, webContents } from 'electron'
import { settingsStore } from 'stores/settings'
import Resolver from 'Runtime/Resolver'
import {
  WB_LIN_NOTIF_RENDER,
  WB_LIN_NOTIF_PLAY_AUDIO,
  WB_LIN_NOTIF_CLICK,
  WB_LIN_NOTIF_CLOSE,
  WB_LIN_NOTIF_PRESENT
} from 'shared/ipcEvents'
import { OSSettings } from 'shared/Models/Settings'

const privLoaded = Symbol('privLoaded')
const privWindow = Symbol('privWindow')
const privNotifications = Symbol('privNotifications')
const privNotificationExpirer = Symbol('privNotificationExpirer')

const WINDOW_WIDTH = 325
const WINDOW_HEIGHT = 65

class LinuxNotification {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privLoaded] = false
    this[privWindow] = undefined
    this[privNotifications] = new Map()
    this[privNotificationExpirer] = null
  }

  /**
  * Loads the tray
  */
  load () {
    if (process.platform !== 'linux') { return }

    if (this.isLoaded) { return }
    this[privLoaded] = true

    settingsStore.listen(this.settingsChanged)
    if (settingsStore.getState().os.notificationsProvider === OSSettings.NOTIFICATION_PROVIDERS.ENHANCED) {
      this.createWindow()
    }
  }

  /**
  * Creates the window
  */
  createWindow () {
    if (this[privWindow]) { return }

    this[privWindow] = new BrowserWindow({
      x: 0,
      y: 0,
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      resizable: false,
      focusable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      backgroundColor: '#FFFFFF',
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        webviewTag: false
      }
    })
    this[privWindow].on('closed', () => { this[privWindow] = undefined })
    this[privWindow].webContents.once('dom-ready', this.handleReady)

    ipcMain.on(WB_LIN_NOTIF_CLICK, this.handleNotificationClick)
    ipcMain.on(WB_LIN_NOTIF_CLOSE, this.handleNotificationClose)
    ipcMain.on(WB_LIN_NOTIF_PRESENT, this.handleNotificationPresent)

    this[privWindow].loadURL(`file://${__dirname}/LinuxNotification.html`)
    this[privWindow].webContents.on('will-navigate', (evt, url) => evt.preventDefault())
  }

  /**
  * Destroys the window
  */
  destroyWindow () {
    if (!this[privWindow]) { return }

    this[privWindow].close()

    ipcMain.removeListener(WB_LIN_NOTIF_CLICK, this.handleNotificationClick)
    ipcMain.removeListener(WB_LIN_NOTIF_CLOSE, this.handleNotificationClose)
    ipcMain.removeListener(WB_LIN_NOTIF_PRESENT, this.handleNotificationPresent)

    this[privNotifications].clear()
    clearTimeout(this[privNotificationExpirer])
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get isLoaded () { return this[privLoaded] }
  get webContentsId () { return this[privWindow] ? this[privWindow].webContents.id : undefined }

  /* ****************************************************************************/
  // Event handlers
  /* ****************************************************************************/

  /**
  * Handles the settings being changed
  * @param settingsState: the new settings state
  */
  settingsChanged = (settingsState) => {
    if (settingsStore.getState().os.notificationsProvider === OSSettings.NOTIFICATION_PROVIDERS.ENHANCED) {
      this.createWindow()
    } else {
      this.destroyWindow()
    }
  }

  /**
  * Handles the dom becoming ready
  * @param evt: the event that fired
  */
  handleReady = (evt) => {
    this.render()
  }

  /**
  * Handles a notification being clicked
  * @param evt: the event that fired
  */
  handleNotificationClick = (evt) => {
    if (evt.sender.id !== this.webContentsId) { return }
    if (this[privNotifications].size === 1) {
      let notification
      for (notification of this[privNotifications].values()) {}
      const wc = webContents.fromId(notification.senderId)
      if (!wc.isDestroyed()) {
        wc.send(WB_LIN_NOTIF_CLICK, notification.id)
      }
    }
    this.clearNotifications()
  }

  /**
  * Handles a notification close request
  * @param evt: the event that fired
  */
  handleNotificationClose = (evt) => {
    if (evt.sender.id !== this.webContentsId) { return }

    this.clearNotifications()
  }

  /**
  * Handles a request to display a notification
  * @param evt: the event that fired
  * @param id: the notification id
  * @param options: the notification options
  */
  handleNotificationPresent = (evt, id, options) => {
    this.presentNotification(id, evt.sender.id, options)
  }

  /* ****************************************************************************/
  // Rendering
  /* ****************************************************************************/

  /**
  * Pushes a render call
  * @param audio=undefined: an optional audio file to play
  */
  render (audio = undefined) {
    if (this[privNotifications].size === 0) {
      this[privWindow].hide()
    } else if (this[privNotifications].size === 1) {
      let notification
      for (notification of this[privNotifications].values()) {}
      this[privWindow].webContents.send(WB_LIN_NOTIF_RENDER, notification.options)
      this.showWindow()
    } else {
      const options = {
        title: 'New Notifications',
        body: `You have ${this[privNotifications].size} Notifications`
      }
      this[privWindow].webContents.send(WB_LIN_NOTIF_RENDER, options)
      this.showWindow()
    }

    if (audio) {
      this[privWindow].webContents.send(WB_LIN_NOTIF_PLAY_AUDIO, audio)
    }
  }

  /**
  * Shows the window ensuring it's positioned correctly
  */
  showWindow () {
    const workArea = screen.getPrimaryDisplay().workArea
    const y = workArea.y + 30
    const x = (workArea.x + workArea.width) - WINDOW_WIDTH - 10
    this[privWindow].setSize(WINDOW_WIDTH, WINDOW_HEIGHT)
    this[privWindow].setPosition(x, y)
    this[privWindow].show()
  }

  /* ****************************************************************************/
  // Notification calls
  /* ****************************************************************************/

  /**
  * Presents a notification
  * @param id: the id of the notification
  * @param senderId: the id of the webcontents that sent the request
  * @param options: the display options for the notification
  */
  presentNotification (id, senderId, options) {
    // Auto-clear
    clearTimeout(this[privNotificationExpirer])
    this[privNotificationExpirer] = setTimeout(() => {
      this.clearNotifications()
    }, 3000)

    // Save
    this[privNotifications].set(id, { options, senderId, id })

    // Store & render
    if (options.sound && this[privNotifications].size === 1) {
      this.render(Resolver.audio(options.sound))
    } else {
      this.render()
    }
  }

  /**
  * Clears the current notifications
  */
  clearNotifications () {
    this[privNotifications].clear()
    clearTimeout(this[privNotificationExpirer])
    this.render()
  }
}

export default new LinuxNotification()
