import { app } from 'electron'
import { EventEmitter } from 'events'

const privStarted = Symbol('privStarted')
const privKeyState = Symbol('privKeyState')
const privFocusLossTO = Symbol('privFocusLossTO')

const MAX_BLUR_TIME = 100
const DEFAULT_KEY_STATE = Object.freeze({
  control: false,
  alt: false,
  shift: false,
  meta: false
})
const KEY_STATE_MEMBERS = Object.keys(DEFAULT_KEY_STATE)

class WaveboxAppCommandKeyTracker extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    this[privStarted] = false
    this[privFocusLossTO] = null
    this[privKeyState] = DEFAULT_KEY_STATE
  }

  /**
  * Starts the watcher
  */
  start () {
    if (this[privStarted]) { return }
    this[privStarted] = true

    if (app.isReady()) {
      throw new Error('WaveboxAppCommandKeyTracker must be started before app.ready()')
    }

    app.on('web-contents-created', this._handleWebContentsCreated)
    app.on('browser-window-blur', this._handleBrowserWindowBlur)
    app.on('browser-window-focus', this._handleBrowserWindowFocus)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  get controlPressed () { return this[privKeyState].control === true }
  get altPressed () { return this[privKeyState].alt === true }
  get shiftPressed () { return this[privKeyState].shift === true }
  get metaPressed () { return this[privKeyState].meta === true }
  get commandOrControlPressed () {
    return process.platform === 'darwin'
      ? this.metaPressed
      : this.controlPressed
  }
  get anyModifierPressed () { return this.controlPressed || this.altPressed || this.shiftPressed || this.metaPressed }

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  /**
  * Handles a web contents being created
  * @param evt: the event that fired
  * @param contents: the contents that was created
  */
  _handleWebContentsCreated = (evt, contents) => {
    setImmediate(() => {
      if (contents.isDestroyed()) { return }
      contents.on('before-input-event', this._handleBeforeInputEvent)
    })
  }

  /**
  * Handles a browser window bluring
  * @param evt: the event that fired
  * @param bw: the browser window that blurred
  */
  _handleBrowserWindowBlur = (evt, bw) => {
    clearTimeout(this[privFocusLossTO])
    this[privFocusLossTO] = setTimeout(() => {
      this._changeKeyState(DEFAULT_KEY_STATE)
    }, MAX_BLUR_TIME)
  }

  /**
  * Handles a browser window focusing
  * @param evt: the event that fired
  * @param bw: the browser window that focused
  */
  _handleBrowserWindowFocus = (evt, bw) => {
    clearTimeout(this[privFocusLossTO])
  }

  /* ****************************************************************************/
  // Web contents events
  /* ****************************************************************************/

  /**
  * Handles an input event coming in
  * @param evt: the event that fired
  * @param input: the input details from the event
  */
  _handleBeforeInputEvent = (evt, input) => {
    this._changeKeyState({
      control: input.control,
      shift: input.shift,
      alt: input.alt,
      meta: input.meta
    })
  }

  /* ****************************************************************************/
  // Data utils
  /* ****************************************************************************/

  /**
  * Handles the key state changing, persisting state and firing off events
  * @param next: the proposed next key state
  */
  _changeKeyState (next) {
    const changed = KEY_STATE_MEMBERS.filter((k) => this[privKeyState][k] !== next[k])
    if (changed.length) {
      const prev = this[privKeyState]
      this[privKeyState] = next
      changed.forEach((k) => {
        this.emit(`${k}-changed`, {}, prev[k], next[k])
      })
      this.emit('changed', {}, prev, next)
    }
  }
}

export default new WaveboxAppCommandKeyTracker()
