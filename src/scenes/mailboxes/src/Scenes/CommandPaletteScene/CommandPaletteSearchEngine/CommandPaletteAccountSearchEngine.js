import Fuse from 'fuse.js'
import fastequal from 'fast-deep-equal'
import { accountStore } from 'stores/account'
import SEARCH_TARGETS from './CommandPaletteSearchTargets'
import { COMMAND_PALETTE_ALL_TERM } from 'shared/constants'

const privFuse = Symbol('privFuse')
const privSearchable = Symbol('privSearchable')

class CommandPaletteAccountSearchEngine {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privFuse] = null
    this[privSearchable] = {
      accounts: [],
      accountsDirty: true
    }
  }

  /* **************************************************************************/
  // Searching: Public
  /* **************************************************************************/

  /**
  * Runs a search on the next tick
  * @param term: the term to search for
  * @return an array of results
  */
  search (term) {
    if (!term) {
      return []
    }

    // Prep fuse
    this._initializeFuse()
    this._updateFuseCollections()

    // Look for low-cost excapes (part 2)
    if (term === COMMAND_PALETTE_ALL_TERM) {
      return this[privFuse].list.map((item) => { return { score: 1.0, item: item } })
    }

    // Perform the search
    return this[privFuse].search(term)
  }

  /**
  * Indicates the accounts need to be updated
  */
  reloadAccounts () {
    this[privSearchable].accountsDirty = true
  }

  /**
  * Generates a recommended set of results
  * @param accountState=autoget: the current account state
  * @return results sorted into targets
  */
  generateRecomendations (accountState = accountStore.getState()) {
    const recommended = []
    const activeService = accountState.activeService()
    if (activeService) {
      recommended.push({
        target: SEARCH_TARGETS.BOOKMARK,
        items: activeService.bookmarks.map((bookmark) => {
          return {
            item: {
              target: SEARCH_TARGETS.BOOKMARK,
              id: bookmark.id,
              parentId: activeService.id
            }
          }
        })
      })
    }

    const recents = accountState.lastAccessedServiceIds(false)
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
    recommended.push({
      target: SEARCH_TARGETS.SERVICE,
      items: recents
    })

    return recommended
  }

  /* **************************************************************************/
  // Searching: Fuse Accounts
  /* **************************************************************************/

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
}

export default CommandPaletteAccountSearchEngine
