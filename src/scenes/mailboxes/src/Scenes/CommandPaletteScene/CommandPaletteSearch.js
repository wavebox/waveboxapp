import { EventEmitter } from 'events'
import Fuse from 'fuse.js'

const TICK_WAIT_MS = 300
const privFuse = Symbol('privFuse')
const privTick = Symbol('privTick')
const privTerm = Symbol('privTerm')

class CommandPaletteSearch extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this[privFuse] = null
    this[privTerm] = null
    this[privTick] = null
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hasTickScheduled () { return this[privTick] !== null }

  /* **************************************************************************/
  // Searching: Public
  /* **************************************************************************/

  /**
  * Runs a search on the next tick
  * @param term: the term to search for
  */
  asyncSearch (term) {
    this[privTerm] = term

    if (!this.hasTickScheduled) {
      this[privTick] = setTimeout(this._performNextTick, TICK_WAIT_MS)
    }
  }

  /* **************************************************************************/
  // Searching: Heavy lifting
  /* **************************************************************************/

  /**
  * Runs the search for the next tick
  */
  _performNextTick = () => {
    clearTimeout(this[privTick])
    this[privTick] = null
  }
}

export default CommandPaletteSearch
