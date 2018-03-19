import { loadModule } from 'hunspell-asm'

const privFactory = Symbol('privFactory')
const privIsLoading = Symbol('privIsLoading')
const privLoadCallbacks = Symbol('privLoadCallbacks')

class HunspellFactory {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privLoadCallbacks] = []
    this[privIsLoading] = false
    this[privFactory] = undefined
  }

  /* **************************************************************************/
  // Creating
  /* **************************************************************************/

  /**
  * Loads the factory
  * @return promise supplied with the factory
  */
  load () {
    if (this[privFactory]) { return Promise.resolve(this[privFactory]) }

    return new Promise((resolve, reject) => {
      this[privLoadCallbacks].push(resolve)
      if (this[privIsLoading]) { return }

      this[privIsLoading] = true
      loadModule().then((factory) => {
        const loadCallbacks = this[privLoadCallbacks]
        this[privFactory] = factory
        this[privIsLoading] = false
        this[privLoadCallbacks] = []
        loadCallbacks.forEach((cb) => cb(factory))
      })
    })
  }
}

export default new HunspellFactory()
