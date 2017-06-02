import uuid from 'uuid'

const { ipcRenderer, remote } = window.nativeRequire('electron')
const { BrowserWindow } = remote
const path = window.nativeRequire('path')

class EnhancedNotificationWindowLinux {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.openNotifications = new Map()
    this.audio = new window.Audio()
    this.currentPath = path.dirname(window.location.href.replace('file://', ''))
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

    this.window.loadURL(`file://${path.join(this.currentPath, 'notification_linux.html')}`)

    this.window.on('page-title-updated', this.handleNotificationEvent)
    this.window.once('ready-to-show', this.handleWindowReady)
    ipcRenderer.on('ping-resource-usage', this.handlePingResourceUsage)
    window.addEventListener('beforeunload', () => {
      this.window.close()
    })
  }

  /* **************************************************************************/
  // App Event Handlers
  /* **************************************************************************/

  handlePingResourceUsage = () => {
    const js = `
      Object.assign({},
        process.getCPUUsage(),
        process.getProcessMemoryInfo(),
        { pid: process.pid, description: 'Notification Service' }
      )
    `
    this.window.webContents.executeJavaScript(js, (res) => {
      ipcRenderer.send('pong-resource-usage', res)
    })
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
  *                   { title, body, icon, sound }
  * @param body: the body string
  * @param icon: the icon url
  * @param clickHandler: the click handler
  * @param clickData: the data to pass back to the click handler
  * @return the notification id
  */
  showNotification (options, clickHandler, clickData) {
    const id = uuid.v4()

    // Play the audio here rather than on each render, but only if there are no open notifications
    if (options.sound && this.openNotifications.size === 0) {
      this.audio.src = `file://${path.join(this.currentPath, '../../audio/', options.sound)}`
      this.audio.currentTime = 0
      this.audio.play()
    }

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

if (process.platform === 'linux') {
  module.exports = new EnhancedNotificationWindowLinux()
} else {
  module.exports = undefined
}
