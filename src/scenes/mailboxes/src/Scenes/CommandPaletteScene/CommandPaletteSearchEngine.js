import { EventEmitter } from 'events'
import Fuse from 'fuse.js'
import fastequal from 'fast-deep-equal'
import { accountStore } from 'stores/account'

const SEARCH_TARGETS = Object.freeze({
  SERVICE: 'SERVICE',
  BOOKMARK: 'BOOKMARK',
  RECENT: 'RECENT',
  READING_QUEUE: 'READING_QUEUE'
})
const DEFAULT_TICK_WAIT_MS = 100
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

    if (this[privTerm]) {
      this.asyncSearch(this[privTerm])
    }
  }

  /**
  * Generates a set of recent services
  * @param accountState=autoget: the current account state
  */
  generateRecentServiceResults (accountState = accountStore.getState()) {
    return accountState.lastAccessedServiceIds(false)
      .map((serviceId) => {
        const service = accountState.getService(serviceId)
        if (!service) { return undefined }
        return {
          item: {
            target: SEARCH_TARGETS.SERVICE,
            id: serviceId,
            parentId: service.parentId
          }
        }
      })
      .filter((rec) => !!rec)
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
      tokenize: true,
      keys: ['0', '1', '2', '3']
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

      // Accounts are pseudo-ordered enough to not cause useless updates
      const accounts = [].concat(
        // Services
        accountState.allServicesUnordered().map((service) => {
          const serviceData = accountState.getServiceData(service.id)
          const serviceDisplayName = accountState.resolvedServiceDisplayName(service.id, undefined)
          const mailboxHelperName = accountState.resolvedMailboxExplicitServiceDisplayName(service.parentId)

          return {
            target: SEARCH_TARGETS.SERVICE,
            id: service.id,
            parentId: service.parentId,
            ...[
              serviceDisplayName,
              serviceDisplayName !== mailboxHelperName ? mailboxHelperName : undefined,
              service.getUrlWithData(serviceData),
              serviceData ? serviceData.documentTitle : undefined
            ]
          }
        }),

        // Reading Queue
        accountState.allReadingQueueItems().map((item) => {
          return {
            target: SEARCH_TARGETS.READING_QUEUE,
            id: item.id,
            parentId: item.serviceId,
            ...[item.title, item.url]
          }
        }),

        // Bookmarks
        accountState.allBookmarkItems().map((item) => {
          return {
            target: SEARCH_TARGETS.BOOKMARK,
            id: item.id,
            parentId: item.serviceId,
            ...[item.title, item.url]
          }
        }),

        // Recents
        // Bookmarks
        accountState.allRecentItems().map((item) => {
          return {
            target: SEARCH_TARGETS.RECENT,
            id: item.id,
            parentId: item.serviceId,
            ...[item.title, item.url]
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

    // Prep fuse
    this._initializeFuse()
    this._updateFuseCollections()

    // Look for low-cost excapes (part 2)
    if (this[privTerm] === ALL_TERM) {
      const all = this[privFuse].list.map((item) => { return { score: 1.0, item: item } })
      this.emit('results-updated', { sender: this }, all, this._sortResultsToTargets(all), this[privTerm])
      return
    }

    // Perform the search
    const results = this[privFuse].search(this[privTerm])
    this.emit('results-updated', { sender: this }, results, this._sortResultsToTargets(results), this[privTerm])
  }
}

export default CommandPaletteSearchEngine
