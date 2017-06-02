import uuid from 'uuid'

const { BrowserWindow } = window.nativeRequire('electron').remote
const path = window.nativeRequire('path')

class EnhancedNotificationWindowLinux {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.openNotifications = new Map()
    this.window = new BrowserWindow({
      x: 0,
      y: 0,
      useContentSize: true,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      resizable: false,
      focusable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      backgroundColor: '#FFFFFF',
      webPreferences: {
        nodeIntegration: true
      }
    })

    const currentPath = path.dirname(window.location.href.replace('file://', ''))
    this.window.loadURL(`file://${path.join(currentPath, 'notification_linux.html')}`)

    this.window.on('page-title-updated', this.handleNotificationEvent)
    this.window.once('ready-to-show', this.handleWindowReady)
  }

  /* **************************************************************************/
  // Window Event handlers
  /* **************************************************************************/

  /**
  * Handles the window becoming ready
  * @param evt: the event that fired
  */
  handleWindowReady = (evt) => {
    this.renderCurrentNotification()
  }

  /**
  * Handles notification events coming from the page title
  * @param evt: the event that fired
  * @param title
  */
  handleNotificationEvent = (evt, title) => {
    if (this.openNotifications.size === 1) {
      let id, notification
      for ([id, notification] of this.openNotifications.entries()) {}

      if (title.startsWith('wbaction:close')) {
        this.openNotifications.delete(id)
        this.renderCurrentNotification()
      } else if (title.startsWith('wbaction:click')) {
        if (notification.clickHandler) {
          notification.clickHandler(notification.clickData)
        }
        this.openNotifications.delete(id)
        this.renderCurrentNotification()
      }
    } else {
      if (title.startsWith('wbaction:close') || title.startsWith('wbaction:click')) {
        this.openNotifications.clear()
        this.renderCurrentNotification()
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the current notification stack
  */
  renderCurrentNotification () {
    if (this.openNotifications.size === 0) {
      this.window.hide()
    } else if (this.openNotifications.size === 1) {
      let notification
      for (notification of this.openNotifications.values()) {}
      this.window.webContents.executeJavaScript(`window.render.apply(this, ${JSON.stringify([notification.options])})`, () => {
        this.window.show()
      })
    } else {
      const options = {
        title: 'New Notifications',
        body: `You have ${this.openNotifications.size} Notifications`
      }
      this.window.webContents.executeJavaScript(`window.render.apply(this, ${JSON.stringify([options])})`, () => {
        this.window.show()
      })
    }
  }

  /* **************************************************************************/
  // Actioning
  /* **************************************************************************/

  /**
  * Does the heavy lifting of presenting a notification on linux
  * @param options: the options to populate the notification with.
  *                   { title, body, icon }
  * @param body: the body string
  * @param icon: the icon url
  * @param clickHandler: the click handler
  * @param clickData: the data to pass back to the click handler
  * @return the notification id
  */
  showNotification (options, clickHandler, clickData) {
    const id = uuid.v4()
    this.openNotifications.set(id, {
      id: id,
      options: options,
      clickHandler: clickHandler,
      clickData: clickData,
      expirer: setTimeout(() => {
        this.closeNotification(id)
      }, 3000)
    })
    this.renderCurrentNotification()
    return id
  }

  /**
  * Closes a notification
  * @param id: the id of the notification
  */
  closeNotification (id) {
    if (this.openNotifications.has(id)) {
      clearTimeout(this.openNotifications.get(id).expirer)
      this.openNotifications.delete(id)
      this.renderCurrentNotification()
    }
  }
}
//TODO audio

if (process.platform === 'linux') {
  module.exports = new EnhancedNotificationWindowLinux()
} else {
  module.exports = undefined
}
