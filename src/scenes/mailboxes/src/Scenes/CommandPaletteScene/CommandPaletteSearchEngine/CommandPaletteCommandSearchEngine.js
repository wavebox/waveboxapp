import Fuse from 'fuse.js'
import fastequal from 'fast-deep-equal'
import { accountStore } from 'stores/account'
import SEARCH_TARGETS from './CommandPaletteSearchTargets'
import { COMMAND_PALETTE_ALL_COMMAND_TERMS } from 'shared/constants'

const privFuse = Symbol('privFuse')
const privSearchable = Symbol('privSearchable')

class CommandPaletteCommandSearchEngine {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privFuse] = null
    this[privSearchable] = {
      commands: [],
      validCommands: new Set(),
      commandsDirty: true
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

    if (COMMAND_PALETTE_ALL_COMMAND_TERMS.has(term)) {
      return this[privSearchable].commands.map((command) => {
        return { score: 1.0, item: command }
      })
    }

    const termCommand = this._getCommandPrefixFromTerm(term)
    if (termCommand && this[privSearchable].validCommands.has(termCommand)) {
      return this._getValidCommandTargetResults(termCommand)
    } else {
      this._initializeFuse()
      this._updateFuseCollections()
      return this[privFuse].search(term)
    }
  }

  /**
  * Indicates the accounts need to be updated
  */
  reloadAccounts () {
    this[privSearchable].commandsDirty = true
  }

  /* **************************************************************************/
  // Searching: Fuse Accounts
  /* **************************************************************************/

  /**
  * Gets the command prefix from the term
  * @param term: the term to use
  * @return just the first
  */
  _getCommandPrefixFromTerm (term) {
    return term.trim().split(' ')[0]
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
      keys: [ 'id', 'modifier', 'keyword', 'helper', 'description' ]
    })
    return true
  }

  /**
  * Updates fuse with the standard collection set
  * @return true if updated, false if no update required
  */
  _updateFuseCollections () {
    let updated = false
    if (this[privSearchable].commandsDirty) {
      const accountState = accountStore.getState()
      const commands = accountState.getAllSupportedServiceCommands().map((command) => {
        return {
          target: SEARCH_TARGETS.COMMAND_SUGGESTION,
          id: `${command.modifier}${command.keyword}`,
          modifier: command.modifier,
          keyword: command.keyword,
          helper: command.helper,
          description: command.description
        }
      })

      // Keep the datastructure simplistic if possible. Mailbox and services
      // aren't guarenteed to be ordered but the ordering is normally
      // pseudo consistent enough not to be a problem
      if (!fastequal(this[privSearchable].commands, commands)) {
        this[privSearchable].commands = commands
        this[privSearchable].validCommands = new Set(commands.map((command) => command.id))
        updated = true
      }

      this[privSearchable].commandsDirty = false
    }

    if (updated) {
      this[privFuse].setCollection([].concat(
        this[privSearchable].commands
      ))
      return true
    } else {
      return false
    }
  }

  /**
  * Gets the valid targets for a command
  * @param termCommand: the command portion of the term
  * @return an array of faked search results which are ordered accounts
  */
  _getValidCommandTargetResults (termCommand) {
    const accountState = accountStore.getState()
    return accountState
      .getServiceIdsSupportingCommand(termCommand[0], termCommand.substr(1), true)
      .map((serviceId) => {
        const service = accountState.getService(serviceId)
        return {
          score: 1.0,
          item: {
            target: SEARCH_TARGETS.COMMAND,
            id: serviceId,
            parentId: service.parentId
          }
        }
      })
  }
}

export default CommandPaletteCommandSearchEngine
