import WaveboxWindow from './WaveboxWindow'

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
    super.create(url, Object.assign({}, safeBrowserWindowOptions, { show: false }))

    // Bind listeners
    this.window.once('ready-to-show', () => {
      this.show()
    })

    return this
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroy (evt) {
    super.destroy(evt)
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

export default ContentPopupWindow
