const WaveboxWindow = require('./WaveboxWindow')
const settingStore = require('../stores/settingStore')
const {
  WB_BROWSER_START_SPELLCHECK
} = require('../../shared/ipcEvents')

class ContentPopupWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    this.boundLanguageUpdated = this.languageUpdated.bind(this)
    this.boundHandleDomReady = this.handleDomReady.bind(this)
  }

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
    super.create(url, Object.assign({}, safeBrowserWindowOptions, { show: false }))

    // Bind listeners
    this.window.once('ready-to-show', () => {
      this.window.show()
    })
    settingStore.on('changed:language', this.boundLanguageUpdated)
    this.window.webContents.on('dom-ready', this.boundHandleDomReady)

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
  // Unsupported Actions
  /* ****************************************************************************/

  findStart () { return this }
  findNext () { return this }
  zoomIn () { return this }
  zoomOut () { return this }
  zoomReset () { return this }
}

module.exports = ContentPopupWindow
