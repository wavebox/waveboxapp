const { shell } = require('electron')
const WaveboxWindow = require('./WaveboxWindow')
const settingStore = require('../stores/settingStore')
const {
  WB_BROWSER_START_SPELLCHECK
} = require('../../shared/ipcEvents')
const ClassTools = require('../ClassTools')

class ExtensionOptionsWindow extends WaveboxWindow {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()
    ClassTools.autobindFunctions(this, [
      'languageUpdated',
      'handleDomReady',
      'handleNewWindow'
    ])
  }

  /* ****************************************************************************/
  // Window lifecycle
  /* ****************************************************************************/

  /**
  * Starts the window
  * @param url: the start url
  * @param options={}: the configuration for the window
  */
  create (url, options = {}) {
    // The browser settings don't need to be sanitized as they should be in the same thread
    // and come from the parent webContents
    super.create(url, Object.assign({}, options, { show: false }))

    // Bind listeners
    this.window.once('ready-to-show', () => {
      this.show()
    })
    settingStore.on('changed:language', this.languageUpdated)
    this.window.webContents.on('dom-ready', this.handleDomReady)
    this.window.webContents.on('new-window', this.handleNewWindow)

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    settingStore.removeListener('changed:language', this.languageUpdated)
    if (this.window && !this.window.isDestroyed() && this.window.webContents) {
      this.window.webContents.removeListener('dom-ready', this.handleDomReady)
      this.window.webContents.removeListener('new-window', this.handleNewWindow)
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

  /**
  * Handles a new window
  * @param evt: the event that fired
  * @param targetUrl: the url to open
  */
  handleNewWindow (evt, targetUrl) {
    evt.preventDefault()
    shell.openExternal(targetUrl)
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

module.exports = ExtensionOptionsWindow
