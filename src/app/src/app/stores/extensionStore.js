const persistence = require('../storage/extensionStorage')
const CoreExtension = require('../../shared/Models/Extensions/CoreExtension')
const { EventEmitter } = require('events')

class ExtensionStore extends EventEmitter {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super()

    // Build the current data
    this.installed = new Map()

    const allRawItems = persistence.allJSONItems()
    Object.keys(allRawItems).forEach((id) => {
      this.installed.set(id, new CoreExtension(allRawItems[id]))
    })

    // Listen for changes
    persistence.on('changed', (evt) => {
      if (evt.type === 'setItem') {
        this.installed.set(evt.key, new CoreExtension(persistence.getJSONItem(evt.key)))
      }
      if (evt.type === 'removeItem') {
        this.installed.delete(evt.key)
      }
      this.emit('changed', {})
    })
  }

  checkAwake () { return true }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the extension
  * @param extensionId: the id of the extension
  * @return the extension or null
  */
  getExtension (extensionId) {
    return this.installed.get(extensionId) || null
  }
}

module.exports = new ExtensionStore()
