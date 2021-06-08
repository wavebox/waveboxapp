import { EventEmitter } from 'events'
import CommandPaletteAccountSearchEngine from './CommandPaletteAccountSearchEngine'
import CommandPaletteCommandSearchEngine from './CommandPaletteCommandSearchEngine'
import {
  COMMAND_PALETTE_VALID_MODIFIERS,
  COMMAND_PALETTE_ALL_TERM,
  COMMAND_PALETTE_ALL_COMMAND_TERMS
} from 'shared/constants'
import SEARCH_TARGETS from './CommandPaletteSearchTargets'

const DEFAULT_TICK_WAIT_MS = 100

const privTickTime = Symbol('privTickTime')
const privTick = Symbol('privTick')
const privTerm = Symbol('privTerm')
const privAccountSearch = Symbol('privAccountSearch')
const privCommandSearch = Symbol('privCommandSearch')

class CommandPaletteSearchEngine extends EventEmitter {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param tickTime=300: the time between ticks
  */
  constructor (tickTime = DEFAULT_TICK_WAIT_MS) {
    super()

    this[privTickTime] = tickTime
    this[privTick] = null
    this[privAccountSearch] = new CommandPaletteAccountSearchEngine()
    this[privCommandSearch] = new CommandPaletteCommandSearchEngine()
    this[privTerm] = null
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get tickTime () { return this[privTickTime] }
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

    if (this._isSearchTermCheapSearch(term)) {
      // Overwrite the existing tick
      clearTimeout(this[privTick])
      this[privTick] = setTimeout(this._performNextTick.bind(this), 1)
    } else {
      if (!this.hasTickScheduled) {
        this[privTick] = setTimeout(this._performNextTick.bind(this), this.tickTime)
      }
    }
  }

  /**
  * Indicates the accounts need to be updaed
  */
  reloadAccounts () {
    this[privAccountSearch].reloadAccounts()
    this[privCommandSearch].reloadAccounts()

    if (this[privTerm]) {
      this.asyncSearch(this[privTerm])
    }
  }

  /**
  * Generates a set of recommended results
  * @param accountState=autoget: the current account state
  * @return the recommendations
  */
  generateRecomendations (...args) {
    return this[privAccountSearch].generateRecomendations(...args)
  }

  /* **************************************************************************/
  // Searching: Tick operations
  /* **************************************************************************/

  /**
  * Runs the search for the next tick
  */
  _performNextTick () {
    clearTimeout(this[privTick])
    this[privTick] = null

    // Look for low-cost escapes (part 1)
    if (!this[privTerm]) {
      this.emit('results-updated', { sender: this }, [], {}, this[privTerm])
      return
    }

    const results = COMMAND_PALETTE_VALID_MODIFIERS.has(this[privTerm][0])
      ? this[privCommandSearch].search(this[privTerm])
      : this[privAccountSearch].search(this[privTerm])
    this.emit('results-updated', { sender: this }, results, this._sortResultsToTargets(results), this[privTerm])
  }

  /**
  * Looks to see if the given search term is cheap
  * @param term: the term to check
  * @return true if cheap, false otherwise
  */
  _isSearchTermCheapSearch (term) {
    if (!term) { return true }
    if (term === COMMAND_PALETTE_ALL_TERM) { return true }
    if (COMMAND_PALETTE_ALL_COMMAND_TERMS.has(term)) { return true }

    return false
  }

  /**
  * Sorts the results into categories
  * @param results: the results to sort
  * @return an object with category keys as ids
  */
  _sortResultsToTargets (results) {
    const initial = Object.keys(SEARCH_TARGETS).reduce((acc, k) => {
      acc[k] = { items: [], target: k, score: 0 }
      return acc
    }, {})
    const targets = results.reduce((acc, res) => {
      acc[res.item.target].items.push(res)
      acc[res.item.target].score += res.score
      return acc
    }, initial)
    Object.values(targets).forEach((target) => {
      target.score = target.score / target.items.length
    })
    return targets
  }
}

export default CommandPaletteSearchEngine
