const WaveboxWindow = require('./WaveboxWindow')
const mouseFB = process.platform === 'linux' ? require('mouse-forward-back') : undefined
const settingStore = require('../stores/settingStore')
const {
  WB_BROWSER_START_SPELLCHECK
} = require('../../shared/ipcEvents')

class ContentPopupWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the window
  * @param url: the start url
  * @param safeBrowserWindowOptions={}: the configuration for the window. Must be directly
  * from the parent webContents
  */
  create (url, safeBrowserWindowOptions = {}) {
    // The browser settings don't need to be sanitized as they should be in the same thread
    // and come from the parent webContents
    super.create(url, safeBrowserWindowOptions)

    // Bind listeners
    this.boundLanguageUpdated = this.languageUpdated.bind(this)
    settingStore.on('changed:language', this.boundLanguageUpdated)
    this.boundHandleDomReady = this.handleDomReady.bind(this)
    this.window.webContents.on('dom-ready', this.boundHandleDomReady)

    // Mouse navigation
    if (process.platform === 'win32') {
      this.window.on('app-command', (evt, cmd) => {
        switch (cmd) {
          case 'browser-backward': this.navigateBack(); break
          case 'browser-forward': this.navigateForward(); break
        }
      })
    } else if (process.platform === 'linux') {
      // Re-register the event on focus as newly focused windows will overwrite this
      this.registerLinuxMouseNavigation()
      this.window.on('focus', () => {
        this.registerLinuxMouseNavigation()
      })
    }

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    settingStore.removeListener('changed:language', this.boundLanguageUpdated)
    if (this.window && !this.window.isDestroyed() && this.window.webContents) {
      this.window.webContents.removeListener('dom-ready', this.boundHandleDomReady)
    }
    super.destroy(evt)
  }

  /* ****************************************************************************/
  // Window events
  /* ****************************************************************************/

  /**
  * Handles the dom being ready
  */
  handleDomReady () {
    this.languageUpdated({ prev: undefined, next: settingStore.language })
  }

  /* ****************************************************************************/
  // Data lifecycle
  /* ****************************************************************************/

  /**
  * Handles the language changing
  * @param prev: the previous language value. also accepts undefined
  * @param next: the new language value
  */
  languageUpdated ({ prev, next }) {
    const prevLang = (prev || {}).spellcheckerLanguage
    const prevSecLang = (prev || {}).secondarySpellcheckerLanguage
    const nextLang = (next || {}).spellcheckerLanguage
    const nextSecLang = (next || {}).secondarySpellcheckerLanguage

    if (prevLang !== nextLang || prevSecLang !== nextSecLang) {
      this.window.webContents.send(WB_BROWSER_START_SPELLCHECK, {
        language: nextLang,
        secondaryLanguage: nextSecLang
      })
    }
  }

  /* ****************************************************************************/
  // Registering
  /* ****************************************************************************/

  /**
  * Binds the listeners for mouse navigation on linux
  */
  registerLinuxMouseNavigation () {
    mouseFB.register((btn) => {
      switch (btn) {
        case 'back': this.navigateBack(); break
        case 'forward': this.navigateForward(); break
      }
    }, this.window.getNativeWindowHandle())
  }

  /* ****************************************************************************/
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
  zoomIn () { return this }
  zoomOut () { return this }
  zoomReset () { return this }
}

module.exports = ContentPopupWindow
