import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItem, Divider } from '@material-ui/core'
import Fuse from 'fuse.js'
import MailboxListItem from './MailboxListItem'
import ServiceListItem from './ServiceListItem'
import { URL } from 'url'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ULinkORListItemText from '../ULinkORListItemText'

const privAccountStore = Symbol('privAccountStore')
const privFuse = Symbol('privFuse')

const RESULT_TYPES = {
  MAILBOX: 'MAILBOX',
  SERVICE: 'SERVICE',
  DIVIDER: 'DIVIDER'
}

class ULinkORAccountSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    targetUrl: PropTypes.string.isRequired,
    searchTerm: PropTypes.string.isRequired,
    accountStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired,
    onOpenInRunningService: PropTypes.func.isRequired,
    onOpenInServiceWindow: PropTypes.func.isRequired,
    onOpenInMailboxWindow: PropTypes.func.isRequired,
    onItemKeyDown: PropTypes.func
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this[privAccountStore] = this.props.accountStore
    this[privFuse] = new Fuse([], {
      threshold: 0.3,
      location: 0,
      distance: 100,
      includeScore: false,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      tokenize: true,
      keys: [
        'displayName',
        'mailboxHelperName',
        'url',
        'title'
      ]
    })

    // Generate state
    const accountState = this[privAccountStore].getState()
    this.state = {
      searchResults: this.generateNewSearchResults(accountState, this.props.searchTerm),
      suggestedResults: this.generateSuggestedSearchResults(accountState, this.props.targetUrl)
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this[privAccountStore].listen(this.accountChanged)
  }

  componentWillUnmount () {
    this[privAccountStore].unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.accountStore !== nextProps.accountStore) {
      console.warn('Changing props.accountStore is not supported in ULinkORAccountResultList and will be ignored')
    }

    if (this.props.searchTerm !== nextProps.searchTerm) {
      const accountState = this[privAccountStore].getState()
      this.setState({
        searchResults: this.generateNewSearchResults(accountState, nextProps.searchTerm)
      })
    }
    if (this.props.targetUrl !== nextProps.targetUrl) {
      const accountState = this[privAccountStore].getState()
      this.setState({
        suggestedResults: this.generateSuggestedSearchResults(accountState, this.props.targetUrl)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  accountChanged = (accountState) => {
    this.setState({
      searchResults: this.generateNewSearchResults(accountState, this.props.searchTerm),
      suggestedResults: this.generateSuggestedSearchResults(accountState, this.props.targetUrl)
    })
  }

  /**
  * Generates a new search results
  * @param accountState: the current account state
  * @param term: the term to search over
  * @return and array of search results
  */
  generateNewSearchResults (accountState, term) {
    if (!term) { return [] }

    const collection = accountState.allServicesUnordered().map((service) => {
      const serviceData = accountState.getServiceData(service.id)
      const serviceDisplayName = accountState.resolvedServiceDisplayName(service.id, undefined)
      const mailboxHelperName = accountState.resolvedMailboxExplicitServiceDisplayName(service.parentId)

      return {
        id: service.id,
        parentId: service.parentId,
        displayName: serviceDisplayName,
        mailboxHelperName: mailboxHelperName,
        url: service.getUrlWithData(serviceData),
        title: serviceData ? serviceData.documentTitle : undefined
      }
    })

    this[privFuse].setCollection(collection)
    const results = this[privFuse].search(term)
    return results.map((res) => {
      return { id: res.id, type: RESULT_TYPES.SERVICE }
    })
  }

  /**
  * @param hostname: a hostname to get tld from
  * @return the top two domains or the original hostname
  */
  getTldFromHostname (hostname) {
    const components = hostname.split('.')
    return components.length > 2
      ? components.slice(-2).join('.')
      : hostname
  }

  /**
  * Generates a set of suggested search results
  * @param accountState: the current account state
  * @param targetUrl: the url we're trying to open
  * @return and array of account ids
  */
  generateSuggestedSearchResults (accountState, targetUrl) {
    // Figure out a little bit about our target url
    const targetRules = ACMailbox.generateAvailableWindowOpenRulesForUrl(targetUrl)
    const { fullMatchHostnames, partialMatchHostnames } = targetRules.reduce((acc, rule) => {
      acc.fullMatchHostnames.add(rule.hostname)
      if (rule.queryHostname) {
        acc.fullMatchHostnames.add(rule.queryHostname)
        const tld = this.getTldFromHostname(rule.queryHostname)
        if (tld !== rule.queryHostname) {
          acc.partialMatchHostnames.add(tld)
        }
      } else {
        const tld = this.getTldFromHostname(rule.hostname)
        if (tld !== rule.hostname) {
          acc.partialMatchHostnames.add(tld)
        }
      }
      return acc
    }, { fullMatchHostnames: new Set(), partialMatchHostnames: new Set() })

    // Filter out our services by what's useful
    const { full, partial } = accountState.allServicesOrdered().reduce((acc, service) => {
      const serviceUrl = service.getUrlWithData(
        accountState.getServiceData(service.id),
        accountState.getMailboxAuthForServiceId(service.id)
      )

      let serviceUrlHostname
      let serviceUrlPartialHostname
      try {
        serviceUrlHostname = new URL(serviceUrl).hostname
        const tld = this.getTldFromHostname(serviceUrlHostname)
        if (tld !== serviceUrlHostname) {
          serviceUrlPartialHostname = serviceUrlHostname
        }
      } catch (ex) { }

      if (serviceUrlHostname && fullMatchHostnames.has(serviceUrlHostname)) {
        acc.full.push(service.id)
      } else if (serviceUrlPartialHostname && fullMatchHostnames.has(serviceUrlPartialHostname)) {
        acc.full.push(service.id)
      } else if (serviceUrlHostname && partialMatchHostnames.has(serviceUrlHostname)) {
        acc.partial.push(service.id)
      } else if (serviceUrlPartialHostname && partialMatchHostnames.has(serviceUrlPartialHostname)) {
        acc.partial.push(service.id)
      }
      return acc
    }, { full: [], partial: [] })

    // Build the return data
    const matches = full.length > 5
      ? full
      : [].concat(full, partial.length <= 4 ? partial : [])

    return [].concat(
      matches.map((serviceId) => {
        return { id: serviceId, type: RESULT_TYPES.SERVICE }
      }),
      matches.length ? [{ type: RESULT_TYPES.DIVIDER }] : [],
      accountState.mailboxIds().map((mailboxId) => {
        return { id: mailboxId, type: RESULT_TYPES.MAILBOX }
      })
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      searchTerm,
      avatarResolver,
      onOpenInRunningService,
      onOpenInServiceWindow,
      onOpenInMailboxWindow,
      onItemKeyDown
    } = this.props
    const {
      searchResults,
      suggestedResults
    } = this.state

    const renderResults = searchTerm ? searchResults : suggestedResults
    return (
      <React.Fragment>
        {renderResults.length ? (
          renderResults.map(({ id, type }, index) => {
            if (type === RESULT_TYPES.MAILBOX) {
              return (
                <MailboxListItem
                  key={id}
                  mailboxId={id}
                  accountStore={this[privAccountStore]}
                  avatarResolver={avatarResolver}
                  onOpenInRunningService={onOpenInRunningService}
                  onOpenInServiceWindow={onOpenInServiceWindow}
                  onOpenInMailboxWindow={onOpenInMailboxWindow}
                  onKeyDown={onItemKeyDown} />
              )
            } else if (type === RESULT_TYPES.SERVICE) {
              return (
                <ServiceListItem
                  key={id}
                  serviceId={id}
                  accountStore={this[privAccountStore]}
                  avatarResolver={avatarResolver}
                  onOpenInRunningService={onOpenInRunningService}
                  onOpenInServiceWindow={onOpenInServiceWindow}
                  onKeyDown={onItemKeyDown} />
              )
            } else if (type === RESULT_TYPES.DIVIDER) {
              return (
                <Divider key={`${index}`} />
              )
            }
          })
        ) : (
          <ListItem>
            <ULinkORListItemText
              primary={`Couldn't find anything for "${searchTerm}"`}
              primaryTypographyProps={{ align: 'center' }} />
          </ListItem>
        )}
      </React.Fragment>
    )
  }
}

export default ULinkORAccountSection
