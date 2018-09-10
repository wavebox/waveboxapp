import electron from 'electron'
const B64_SVG_PREFIX = 'data:image/svg+xml;base64,'
const TICK_SVG = window.atob(require('shared/b64Assets').TICK_SVG.replace(B64_SVG_PREFIX, ''))

class TrayRenderer {
  /* **************************************************************************/
  // Canvas Utils
  /* **************************************************************************/

  /**
  * Renders a rounded rectangle into the canvas
  * @param ctx: the context to draw into
  * @param x: top left x coordinate
  * @param y: top top left y coordinate
  * @param width: width of rect
  * @param height: height of rect
  * @param radius=5: corner radius
  * @param fill=false: fill the rect
  * @param stroke=true: stroke the rect
  */
  static roundRect (ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    if (stroke) { ctx.stroke() }
    if (fill) { ctx.fill() }
  }

  /* **************************************************************************/
  // Canvas Rendering
  /* **************************************************************************/

  /**
  * Renders the tray icon as a canvas
  * @param size: the pixel size to render
  * @param tray: the tray settings
  * @param unreadCount: the current unread count
  * @param hasUnreadActivity: true if we have unread activity
  * @return promise with the canvas
  */
  static renderCanvas (size, tray, unreadCount, hasUnreadActivity) {
    if (process.platform === 'darwin') {
      return this.renderCanvasDarwin(size, tray, unreadCount, hasUnreadActivity)
    } else if (process.platform === 'win32') {
      return this.renderCanvasWin32(size, tray, unreadCount, hasUnreadActivity)
    } else if (process.platform === 'linux') {
      return this.renderCanvasLinux(size, tray, unreadCount, hasUnreadActivity)
    } else {
      return Promise.reject(new Error('Unknown Platform'))
    }
  }

  /**
  * Renders the tray icon as a canvas with darwin tweaks
  * @param size: the pixel size to render
  * @param tray: the tray settings
  * @param unreadCount: the current unread count
  * @param hasUnreadActivity: true if we have unread activity
  * @return promise with the canvas
  */
  static renderCanvasDarwin (size, tray, unreadCount, hasUnreadActivity) {
    return new Promise((resolve, reject) => {
      const SIZE = size * tray.dpiMultiplier
      const PADDING = Math.floor(SIZE * 0.15)
      const REAL_CENTER = SIZE / 2
      const CENTER = Math.round(REAL_CENTER)
      const STROKE_WIDTH = Math.max(1, Math.round(SIZE * 0.05))
      const BORDER_RADIUS = Math.round(SIZE * 0.1)
      const SHOW_COUNT = tray.showUnreadCount && (unreadCount > 0 || hasUnreadActivity)
      const COLOR = unreadCount || hasUnreadActivity ? tray.unreadColor : tray.readColor
      const BACKGROUND_COLOR = unreadCount || hasUnreadActivity ? tray.unreadBackgroundColor : tray.readBackgroundColor

      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')

      // Trick to turn off AA
      if (tray.dpiMultiplier % 2 !== 0) {
        ctx.translate(0.5, 0.5)
      }

      // Circle
      ctx.beginPath()
      ctx.fillStyle = BACKGROUND_COLOR
      ctx.strokeStyle = COLOR
      ctx.lineWidth = STROKE_WIDTH
      this.roundRect(ctx, PADDING, PADDING, SIZE - (2 * PADDING), SIZE - (2 * PADDING), BORDER_RADIUS, true, true)

      if (SHOW_COUNT) {
        ctx.fillStyle = COLOR
        ctx.textAlign = 'center'
        if (unreadCount > 0) {
          if (unreadCount > 99) { // 99+
            ctx.font = `${Math.round(SIZE * 0.8)}px Helvetica`
            ctx.fillText('●', CENTER, Math.round(CENTER + (SIZE * 0.22)))
          } else if (unreadCount < 10) { // 0 - 9
            ctx.font = `${Math.round(SIZE * 0.6)}px Helvetica`
            ctx.fillText(unreadCount, CENTER, Math.round(CENTER + (SIZE * 0.2)))
          } else { // 10 - 99
            ctx.font = `${Math.round(SIZE * 0.52)}px Helvetica`
            ctx.fillText(unreadCount, CENTER, Math.round(CENTER + (SIZE * 0.17)))
          }
        } else { // Unread activity
          ctx.font = `${Math.round(SIZE * 0.8)}px Helvetica`
          ctx.fillText('●', CENTER, Math.round(CENTER + (SIZE * 0.22)))
        }
        resolve(canvas)
      } else {
        const loader = new window.Image()
        loader.onload = function () {
          ctx.drawImage(loader, PADDING, PADDING, SIZE - (2 * PADDING), SIZE - (2 * PADDING))
          resolve(canvas)
        }
        loader.src = B64_SVG_PREFIX + window.btoa(TICK_SVG.replace('fill="#000000"', `fill="${COLOR}"`))
      }
    })
  }

  /**
  * Renders the tray icon as a canvas with win32 tweaks
  * @param size: the pixel size to render
  * @param tray: the tray settings
  * @param unreadCount: the current unread count
  * @param hasUnreadActivity: true if we have unread activity
  * @return promise with the canvas
  */
  static renderCanvasWin32 (size, tray, unreadCount, hasUnreadActivity) {
    return new Promise((resolve, reject) => {
      const SIZE = size * tray.dpiMultiplier
      const REAL_CENTER = SIZE / 2
      const CENTER = Math.round(REAL_CENTER)
      const STROKE_WIDTH = Math.max(2, Math.round(SIZE * 0.15))
      const SHOW_COUNT = tray.showUnreadCount && (unreadCount > 0 || hasUnreadActivity)
      const COLOR = unreadCount || hasUnreadActivity ? tray.unreadColor : tray.readColor
      const BACKGROUND_COLOR = unreadCount || hasUnreadActivity ? tray.unreadBackgroundColor : tray.readBackgroundColor

      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')

      // Circle
      ctx.beginPath()
      ctx.fillStyle = BACKGROUND_COLOR
      ctx.strokeStyle = COLOR
      ctx.lineWidth = STROKE_WIDTH
      this.roundRect(ctx, STROKE_WIDTH, STROKE_WIDTH, SIZE - (2 * STROKE_WIDTH), SIZE - (2 * STROKE_WIDTH), 0, true, true)

      if (SHOW_COUNT) {
        ctx.fillStyle = COLOR
        ctx.textAlign = 'center'
        if (unreadCount > 0) {
          if (unreadCount > 99) { // 99+
            ctx.font = `Bold ${Math.round(SIZE * 0.8)}px Helvetica`
            ctx.fillText('●', CENTER, Math.round(CENTER + (SIZE * 0.23)))
          } else if (unreadCount < 10) { // 0 - 9
            ctx.font = `Bold ${Math.round(SIZE * 0.7)}px Helvetica`
            ctx.fillText(unreadCount, CENTER, Math.round(CENTER + (SIZE * 0.25)))
          } else { // 10 - 99
            ctx.font = `Bold ${Math.round(SIZE * 0.55)}px Helvetica`
            ctx.fillText(unreadCount, CENTER, Math.round(CENTER + (SIZE * 0.17)))
          }
        } else { // Unread activity
          ctx.font = `Bold ${Math.round(SIZE * 0.8)}px Helvetica`
          ctx.fillText('●', CENTER, Math.round(CENTER + (SIZE * 0.23)))
        }
        resolve(canvas)
      } else {
        const loader = new window.Image()
        loader.onload = function () {
          ctx.drawImage(loader, 0, 0, SIZE, SIZE)
          resolve(canvas)
        }
        loader.src = B64_SVG_PREFIX + window.btoa(TICK_SVG.replace('fill="#000000"', `fill="${COLOR}"`))
      }
    })
  }

  /**
  * Renders the tray icon as a canvas with linux tweaks
  * @param size: the pixel size to render
  * @param tray: the tray settings
  * @param unreadCount: the current unread count
  * @param hasUnreadActivity: true if we have unread activity
  * @return promise with the canvas
  */
  static renderCanvasLinux (size, tray, unreadCount, hasUnreadActivity) {
    return new Promise((resolve, reject) => {
      const SIZE = size * tray.dpiMultiplier
      const PADDING = Math.floor(SIZE * 0.15)
      const REAL_CENTER = SIZE / 2
      const CENTER = Math.round(REAL_CENTER)
      const STROKE_WIDTH = Math.max(1, Math.round(SIZE * 0.05))
      const SHOW_COUNT = tray.showUnreadCount && (unreadCount > 0 || hasUnreadActivity)
      const BORDER_RADIUS = Math.round(SIZE * 0.1)
      const COLOR = unreadCount || hasUnreadActivity ? tray.unreadColor : tray.readColor
      const BACKGROUND_COLOR = unreadCount || hasUnreadActivity ? tray.unreadBackgroundColor : tray.readBackgroundColor

      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')

      // Trick to turn off AA
      if (tray.dpiMultiplier % 2 !== 0) {
        ctx.translate(0.5, 0.5)
      }

      // Circle
      ctx.beginPath()
      ctx.fillStyle = BACKGROUND_COLOR
      ctx.strokeStyle = COLOR
      ctx.lineWidth = STROKE_WIDTH
      this.roundRect(ctx, PADDING, PADDING, SIZE - (2 * PADDING), SIZE - (2 * PADDING), BORDER_RADIUS, true, true)

      if (SHOW_COUNT) {
        ctx.fillStyle = COLOR
        ctx.textAlign = 'center'
        if (unreadCount > 0) {
          if (unreadCount > 99) { // 99+
            ctx.font = `${Math.round(SIZE * 0.8)}px Helvetica`
            ctx.fillText('●', CENTER, Math.round(CENTER + (SIZE * 0.21)))
          } else if (unreadCount < 10) { // 0-9
            ctx.font = `${Math.round(SIZE * 0.6)}px Helvetica`
            ctx.fillText(unreadCount, CENTER, Math.round(CENTER + (SIZE * 0.2)))
          } else { // 10 - 99
            ctx.font = `${Math.round(SIZE * 0.52)}px Helvetica`
            ctx.fillText(unreadCount, CENTER, Math.round(CENTER + (SIZE * 0.17)))
          }
        } else { // Unread activity
          ctx.font = `${Math.round(SIZE * 0.8)}px Helvetica`
          ctx.fillText('●', CENTER, Math.round(CENTER + (SIZE * 0.21)))
        }

        resolve(canvas)
      } else {
        const loader = new window.Image()
        loader.onload = function () {
          ctx.drawImage(loader, PADDING, PADDING, SIZE - (2 * PADDING), SIZE - (2 * PADDING))
          resolve(canvas)
        }
        loader.src = B64_SVG_PREFIX + window.btoa(TICK_SVG.replace('fill="#000000"', `fill="${COLOR}"`))
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the tray icon as a data64 png image
  * @param size: the pixel size to render
  * @param tray: the tray settings
  * @param unreadCount: the current unread count
  * @param hasUnreadActivity: true if we have unread activity
  * @return promise with the native image
  */
  static renderPNGDataImage (size, tray, unreadCount, hasUnreadActivity) {
    return Promise.resolve()
      .then(() => TrayRenderer.renderCanvas(size, tray, unreadCount, hasUnreadActivity))
      .then((canvas) => Promise.resolve(canvas.toDataURL('image/png')))
  }

  /**
  * Renders the tray icon as a native image
  * @param size: the pixel size to render
  * @param tray: the tray settings
  * @param unreadCount: the current unread count
  * @param hasUnreadActivity: true if we have unread activity
  * @return the native image
  */
  static renderNativeImage (size, tray, unreadCount, hasUnreadActivity) {
    return Promise.resolve()
      .then(() => TrayRenderer.renderCanvas(size, tray, unreadCount, hasUnreadActivity))
      .then((canvas) => {
        const pngData = electron.remote.nativeImage.createFromDataURL(canvas.toDataURL('image/png')).toPNG()
        return Promise.resolve(electron.remote.nativeImage.createFromBuffer(pngData, tray.dpiMultiplier))
      })
  }
}

export default TrayRenderer
