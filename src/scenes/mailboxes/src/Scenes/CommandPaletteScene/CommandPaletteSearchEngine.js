import { EventEmitter } from 'events'
import Fuse from 'fuse.js'
import fastequal from 'fast-deep-equal'
import { accountStore } from 'stores/account'

const SEARCH_TARGETS = Object.freeze({
  MAILBOX: 'MAILBOX',
  SERVICE: 'SERVICE'
})
const DEFAULT_TICK_WAIT_MS = 150
const ALL_TERM = '**'

const privTickTime = Symbol('privTickTime')
const privTick = Symbol('privTick')
const privFuse = Symbol('privFuse')
const privTerm = Symbol('privTerm')
const privSearchable = Symbol('privSearchable')

class CommandPaletteSearchEngine extends EventEmitter {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get SEARCH_TARGETS () { return SEARCH_TARGETS }

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
    this[privFuse] = null
    this[privTerm] = null
    this[privSearchable] = {
      accounts: [],
      accountsDirty: true
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get SEARCH_TARGETS () { return SEARCH_TARGETS }
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
    this[privSearchable].accountsDirty = true
  }

  /* **************************************************************************/
  // Searching: Heavy lifting
  /* **************************************************************************/

  /**
  * Looks to see if the given search term is cheap
  * @param term: the term to check
  * @return true if cheap, false otherwise
  */
  _isSearchTermCheapSearch (term) {
    if (!term) { return true }
    if (term === ALL_TERM) { return true }

    return false
  }

  /**
  * Inits the fuse search if it's not initialized already
  * @return true if initialized afresh, false if already inited
  */
  _initializeFuse () {
    if (this[privFuse] !== null) { return false }
    this[privFuse] = new Fuse([], {
      threshold: 0.3,
      location: 0,
      distance: 100,
      includeScore: true,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [ '0', '1', '2' ]
    })
    return true
  }

  /**
  * Updates fuse with the standard collection set
  * @return true if updated, false if no update required
  */
  _updateFuseCollections () {
    let updated = false
    if (this[privSearchable].accountsDirty) {
      const accountState = accountStore.getState()

      const accounts = [].concat(
        accountState.allMailboxes().map((mailbox) => {
          return {
            target: SEARCH_TARGETS.MAILBOX,
            id: mailbox.id,
            ...[accountState.resolvedMailboxDisplayName(mailbox.id, undefined)]
          }
        }),
        accountState.allServicesUnordered().map((service) => { // pseudo-ordered enough to not cause useless updates
          const serviceData = accountState.getServiceData(service.id)
          return {
            target: SEARCH_TARGETS.SERVICE,
            id: service.id,
            ...([].concat(
              [accountState.resolvedServiceDisplayName(service.id, undefined)],
              serviceData ? [ serviceData.documentTitle, serviceData.url ] : undefined
            ))
          }
        })
      )

      // Keep the datastructure simplistic if possible. Mailbox and services
      // aren't guarenteed to be ordered but the ordering is normally
      // pseudo consistent enough not to be a problem
      if (!fastequal(this[privSearchable].accounts, accounts)) {
        this[privSearchable].accounts = accounts
        updated = true
      }

      this[privSearchable].accountsDirty = false
    }

    if (updated) {
      this[privFuse].setCollection([].concat(
        this[privSearchable].accounts
      ))
      return true
    } else {
      return false
    }
  }

  /**
  * Runs the search for the next tick
  */
  _performNextTick () {
    clearTimeout(this[privTick])
    this[privTick] = null

    // Look for low-cost escapes (part 1)
    if (!this[privTerm]) {
      this.emit('results-updated', { sender: this }, [])
      return
    }

    // Prep fuse
    this._initializeFuse()
    this._updateFuseCollections()

    // Look for low-cost excapes (part 2)
    if (this[privTerm] === ALL_TERM) {
      const all = this[privFuse].list.map((item) => { return { score: 1.0, item: item } })
      this.emit('results-updated', { sender: this }, all)
      return
    }

    // Perform the search
    const results = this[privFuse].search(this[privTerm])
    this.emit('results-updated', { sender: this }, results)
  }
}

export default CommandPaletteSearchEngine
